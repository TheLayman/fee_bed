import { ConfidentialClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import { AuthenticationProvider } from "@microsoft/microsoft-graph-client";

interface GraphSearchHit {
  resource: {
    id: string;
    name?: string;
    webUrl: string;
    lastModifiedDateTime?: string;
  };
  summary?: string;
}

interface GraphSite {
  id: string;
  name: string;
  webUrl: string;
  description?: string;
  lastModifiedDateTime?: string;
}

// Custom auth provider for Graph API
class GraphAuthProvider implements AuthenticationProvider {
  private clientApp: ConfidentialClientApplication;

  constructor() {
    this.clientApp = new ConfidentialClientApplication({
      auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID || "",
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`,
      },
    });
  }

  async getAccessToken(): Promise<string> {
    try {
      const clientCredentialRequest = {
        scopes: ["https://graph.microsoft.com/.default"],
      };

      const response = await this.clientApp.acquireTokenByClientCredential(
        clientCredentialRequest
      );

      if (!response?.accessToken) {
        throw new Error("Failed to acquire access token");
      }

      return response.accessToken;
    } catch (error) {
      console.error("Error acquiring token:", error);
      throw error;
    }
  }
}

export class GraphService {
  private graphClient: Client;
  private authProvider: GraphAuthProvider;

  constructor() {
    this.authProvider = new GraphAuthProvider();
    this.graphClient = Client.initWithMiddleware({
      authProvider: this.authProvider,
    });
  }

  async searchSharePoint(query: string, limit = 10) {
    try {
      const searchRequest = {
        requests: [
          {
            entityTypes: ["driveItem"],
            query: {
              queryString: query,
            },
            size: limit,
          },
        ],
      };

      const response = await this.graphClient
        .api("/search/query")
        .post(searchRequest);

      return this.formatSharePointResults(response.value[0]?.hitsContainers[0]?.hits || []);
    } catch (error) {
      console.error("SharePoint search error:", error);
      return [];
    }
  }

  async searchOneDrive(query: string, limit = 10) {
    try {
      const searchRequest = {
        requests: [
          {
            entityTypes: ["driveItem"],
            query: {
              queryString: `${query} AND path:OneDrive`,
            },
            size: limit,
          },
        ],
      };

      const response = await this.graphClient
        .api("/search/query")
        .post(searchRequest);

      return this.formatOneDriveResults(response.value[0]?.hitsContainers[0]?.hits || []);
    } catch (error) {
      console.error("OneDrive search error:", error);
      return [];
    }
  }

  async searchSites(query: string) {
    try {
      const response = await this.graphClient
        .api("/sites")
        .filter(`search("${query}")`)
        .select("id,name,webUrl,description,lastModifiedDateTime")
        .get();

      return response.value.map((site: GraphSite) => ({
        id: site.id,
        title: site.name,
        url: site.webUrl,
        summary: site.description || `SharePoint site: ${site.name}`,
        source: "sharepoint" as const,
        lastModified: site.lastModifiedDateTime,
      }));
    } catch (error) {
      console.error("Sites search error:", error);
      return [];
    }
  }

  private formatSharePointResults(hits: GraphSearchHit[]) {
    return hits.map((hit: GraphSearchHit) => ({
      id: hit.resource.id,
      title: hit.resource.name || "Untitled Document",
      url: hit.resource.webUrl,
      summary: hit.summary || `SharePoint document: ${hit.resource.name}`,
      source: "sharepoint" as const,
      lastModified: hit.resource.lastModifiedDateTime,
    }));
  }

  private formatOneDriveResults(hits: GraphSearchHit[]) {
    return hits.map((hit: GraphSearchHit) => ({
      id: hit.resource.id,
      title: hit.resource.name || "Untitled Document",
      url: hit.resource.webUrl,
      summary: hit.summary || `OneDrive document: ${hit.resource.name}`,
      source: "onedrive" as const,
      lastModified: hit.resource.lastModifiedDateTime,
    }));
  }
}

export const graphService = new GraphService();