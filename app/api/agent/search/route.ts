import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { graphService } from "@/lib/graph";
import { nlpService } from "@/lib/nlp";

interface SearchResult {
  id: string;
  title: string;
  url: string;
  summary: string;
  source: "sharepoint" | "onedrive" | "wiki";
  lastModified?: string;
}

interface AgentResponse {
  answer: string;
  results: SearchResult[];
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { question } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Process the question using NLP
    const processed = nlpService.processQuestion(question);
    console.log("Processed question:", processed);

    // Search different sources in parallel
    const searchPromises = [];

    // Only search if Microsoft Graph is configured
    if (process.env.MICROSOFT_CLIENT_ID && 
        process.env.MICROSOFT_CLIENT_SECRET && 
        process.env.MICROSOFT_TENANT_ID) {
      searchPromises.push(
        graphService.searchSharePoint(processed.searchQuery, 5),
        graphService.searchOneDrive(processed.searchQuery, 5),
        graphService.searchSites(processed.searchQuery)
      );
    }

    // Add mock wiki search for demonstration
    searchPromises.push(searchMockWiki(processed.searchQuery));

    const searchResults = await Promise.allSettled(searchPromises);
    
    // Combine and format results
    const allResults: SearchResult[] = [];
    
    searchResults.forEach((result, index) => {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        allResults.push(...result.value);
      } else if (result.status === "rejected") {
        console.error(`Search ${index} failed:`, result.reason);
      }
    });

    // Sort by relevance (simple scoring based on keyword matches)
    const sortedResults = allResults
      .map(result => ({
        ...result,
        score: calculateRelevanceScore(result, processed.keywords)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Limit to top 10 results

    // Generate natural language answer
    const answer = nlpService.generateAnswer(question, sortedResults);

    const response: AgentResponse = {
      answer,
      results: sortedResults.map(({ score: _, ...result }) => result),
      confidence: processed.confidence
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Agent search error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your question" },
      { status: 500 }
    );
  }
}

// Mock wiki search for demonstration purposes
async function searchMockWiki(query: string): Promise<SearchResult[]> {
  // This would normally search your internal wiki system
  const mockWikiResults = [
    {
      id: "wiki-1",
      title: "Employee Handbook - Remote Work Policy",
      url: "/wiki/remote-work-policy",
      summary: "Comprehensive guide to remote work policies including equipment, hours, and communication guidelines.",
      source: "wiki" as const,
      lastModified: "2024-01-15T00:00:00Z"
    },
    {
      id: "wiki-2", 
      title: "IT Support - Password Reset Procedures",
      url: "/wiki/password-reset",
      summary: "Step-by-step instructions for resetting passwords and accessing IT support.",
      source: "wiki" as const,
      lastModified: "2024-02-01T00:00:00Z"
    },
    {
      id: "wiki-3",
      title: "HR Benefits - Vacation Request Process",
      url: "/wiki/vacation-requests",
      summary: "How to request vacation time, approval process, and blackout periods.",
      source: "wiki" as const,
      lastModified: "2024-01-20T00:00:00Z"
    }
  ];

  // Simple keyword matching for demo
  const keywords = query.toLowerCase().split(" ");
  return mockWikiResults.filter(result => 
    keywords.some(keyword => 
      result.title.toLowerCase().includes(keyword) ||
      result.summary.toLowerCase().includes(keyword)
    )
  );
}

function calculateRelevanceScore(result: SearchResult, keywords: string[]): number {
  let score = 0;
  const text = `${result.title} ${result.summary}`.toLowerCase();
  
  keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 1;
    }
  });

  // Boost score based on source priority
  switch (result.source) {
    case "wiki":
      score += 2; // Internal wikis are often most relevant
      break;
    case "sharepoint":
      score += 1.5;
      break;
    case "onedrive":
      score += 1;
      break;
  }

  return score;
}