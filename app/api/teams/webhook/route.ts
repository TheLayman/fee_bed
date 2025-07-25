import { NextRequest, NextResponse } from "next/server";
import { nlpService } from "@/lib/nlp";
import { graphService } from "@/lib/graph";

interface SearchResult {
  id: string;
  title: string;
  url: string;
  summary: string;
  source: "sharepoint" | "onedrive" | "wiki";
  lastModified?: string;
}

interface TeamsMessage {
  type: string;
  id: string;
  timestamp: string;
  from: {
    id: string;
    name: string;
  };
  text: string;
  conversation: {
    id: string;
  };
}

interface TeamsAttachment {
  contentType: string;
  content: {
    type: string;
    version: string;
    body: Array<{
      type: string;
      [key: string]: unknown;
    }>;
  };
}

interface TeamsResponse {
  type: "message";
  text: string;
  attachments?: TeamsAttachment[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify Teams webhook (simplified for demo)
    if (body.type === "conversationUpdate") {
      // Teams bot installation/update event
      return NextResponse.json({}, { status: 200 });
    }

    if (body.type !== "message" || !body.text) {
      return NextResponse.json({}, { status: 200 });
    }

    const message: TeamsMessage = body;
    
    // Skip bot's own messages
    if (message.from.name?.includes("Bot")) {
      return NextResponse.json({}, { status: 200 });
    }

    // Process the question
    const processed = nlpService.processQuestion(message.text);
    
    // Search for answers
    const searchPromises = [];
    
    if (process.env.MICROSOFT_CLIENT_ID && 
        process.env.MICROSOFT_CLIENT_SECRET && 
        process.env.MICROSOFT_TENANT_ID) {
      searchPromises.push(
        graphService.searchSharePoint(processed.searchQuery, 3),
        graphService.searchOneDrive(processed.searchQuery, 3),
        graphService.searchSites(processed.searchQuery)
      );
    }

    // Add mock wiki search
    searchPromises.push(searchMockWiki(processed.searchQuery));

    const searchResults = await Promise.allSettled(searchPromises);
    const allResults: SearchResult[] = [];
    
    searchResults.forEach((result) => {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        allResults.push(...result.value);
      }
    });

    // Generate response
    const answer = nlpService.generateAnswer(message.text, allResults);
    
    // Format response for Teams
    const teamsResponse: TeamsResponse = {
      type: "message",
      text: answer
    };

    // Add attachment with relevant documents if found
    if (allResults.length > 0) {
      const topResults = allResults.slice(0, 3);
      const attachment = {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          type: "AdaptiveCard",
          version: "1.0",
          body: [
            {
              type: "TextBlock",
              text: "Relevant Documents:",
              weight: "bolder",
              size: "medium"
            },
            ...topResults.map((result: SearchResult) => ({
              type: "ColumnSet",
              columns: [
                {
                  type: "Column",
                  width: "stretch",
                  items: [
                    {
                      type: "TextBlock",
                      text: `[${result.title}](${result.url})`,
                      weight: "bolder"
                    },
                    {
                      type: "TextBlock",
                      text: result.summary,
                      wrap: true,
                      size: "small"
                    }
                  ]
                },
                {
                  type: "Column",
                  width: "auto",
                  items: [
                    {
                      type: "TextBlock",
                      text: result.source,
                      size: "small",
                      color: "accent"
                    }
                  ]
                }
              ]
            }))
          ]
        }
      };

      teamsResponse.attachments = [attachment];
    }

    return NextResponse.json(teamsResponse);

  } catch (error) {
    console.error("Teams webhook error:", error);
    
    return NextResponse.json({
      type: "message",
      text: "I'm sorry, I encountered an error while processing your question. Please try again later."
    });
  }
}

// Mock wiki search for Teams integration
async function searchMockWiki(query: string): Promise<SearchResult[]> {
  const mockWikiResults: SearchResult[] = [
    {
      id: "wiki-1",
      title: "Employee Handbook - Remote Work Policy",
      url: "https://company.sharepoint.com/wiki/remote-work-policy",
      summary: "Comprehensive guide to remote work policies including equipment, hours, and communication guidelines.",
      source: "wiki" as const
    },
    {
      id: "wiki-2", 
      title: "IT Support - Password Reset Procedures",
      url: "https://company.sharepoint.com/wiki/password-reset",
      summary: "Step-by-step instructions for resetting passwords and accessing IT support.",
      source: "wiki" as const
    },
    {
      id: "wiki-3",
      title: "HR Benefits - Vacation Request Process",
      url: "https://company.sharepoint.com/wiki/vacation-requests",
      summary: "How to request vacation time, approval process, and blackout periods.",
      source: "wiki" as const
    }
  ];

  const keywords = query.toLowerCase().split(" ");
  return mockWikiResults.filter(result => 
    keywords.some(keyword => 
      result.title.toLowerCase().includes(keyword) ||
      result.summary.toLowerCase().includes(keyword)
    )
  );
}