"use client";

import { useState } from "react";

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

export default function AgentClient() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/agent/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data: AgentResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "sharepoint":
        return "bg-blue-100 text-blue-800";
      case "onedrive":
        return "bg-green-100 text-green-800";
      case "wiki":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            Ask a question
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., How do I request vacation time? What is our remote work policy?"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Searching..." : "Ask Question"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {response && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Answer</h3>
            <p className="text-green-700">{response.answer}</p>
            <div className="mt-2 text-sm text-green-600">
              Confidence: {Math.round(response.confidence * 100)}%
            </div>
          </div>

          {response.results.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Related Documents</h3>
              <div className="space-y-4">
                {response.results.map((result) => (
                  <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-600 hover:text-blue-800">
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            {result.title}
                          </a>
                        </h4>
                        <p className="text-gray-600 mt-1 text-sm">{result.summary}</p>
                        {result.lastModified && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last modified: {new Date(result.lastModified).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSourceBadgeColor(result.source)}`}>
                        {result.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}