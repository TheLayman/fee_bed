import natural from "natural";

export interface ProcessedQuestion {
  originalQuestion: string;
  keywords: string[];
  searchQuery: string;
  intent: string;
  confidence: number;
}

interface SearchResult {
  id: string;
  title: string;
  url: string;
  summary: string;
  source: "sharepoint" | "onedrive" | "wiki";
  lastModified?: string;
}

export class NLPService {
  private tokenizer: natural.WordTokenizer;
  private stemmer: typeof natural.PorterStemmer;
  private analyzer: natural.SentimentAnalyzer;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.analyzer = new natural.SentimentAnalyzer("English", this.stemmer, "afinn");
  }

  processQuestion(question: string): ProcessedQuestion {
    // Clean and tokenize the question
    const cleanQuestion = question.toLowerCase().trim();
    const tokens = this.tokenizer.tokenize(cleanQuestion) || [];
    
    // Remove stop words
    const stopWords = new Set([
      "what", "how", "where", "when", "why", "who", "which", "the", "a", "an",
      "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
      "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
      "do", "does", "did", "will", "would", "could", "should", "may", "might",
      "can", "i", "you", "he", "she", "it", "we", "they", "me", "him", "her",
      "us", "them", "my", "your", "his", "her", "its", "our", "their"
    ]);

    const keywords = tokens
      .filter(token => !stopWords.has(token))
      .filter(token => token.length > 2)
      .map(token => this.stemmer.stem(token));

    // Identify intent patterns
    const intent = this.identifyIntent(cleanQuestion);
    
    // Create search query
    const searchQuery = this.createSearchQuery(keywords, intent);
    
    // Calculate confidence based on keyword relevance
    const confidence = this.calculateConfidence(keywords, intent);

    return {
      originalQuestion: question,
      keywords: [...new Set(keywords)], // Remove duplicates
      searchQuery,
      intent,
      confidence
    };
  }

  private identifyIntent(question: string): string {
    const intentPatterns = {
      "policy": /policy|policies|rule|rules|regulation|guideline/i,
      "procedure": /how.*do|process|procedure|step|guide|instruction/i,
      "contact": /contact|phone|email|reach|talk.*to|find.*person/i,
      "location": /where.*is|location|address|room|building|office/i,
      "time": /when|time|date|schedule|hour|deadline/i,
      "benefits": /benefit|insurance|healthcare|vacation|leave|pto/i,
      "payroll": /pay|salary|wage|payroll|paycheck|compensation/i,
      "technology": /computer|software|system|password|login|access|it/i,
      "training": /training|course|certification|learn|education/i,
      "general": /.*/
    };

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(question)) {
        return intent;
      }
    }

    return "general";
  }

  private createSearchQuery(keywords: string[], intent: string): string {
    // Enhance search query based on intent
    const intentKeywords = {
      "policy": ["policy", "procedure", "guidelines"],
      "procedure": ["how to", "steps", "process"],
      "contact": ["contact", "directory", "phone"],
      "location": ["location", "address", "map"],
      "time": ["schedule", "calendar", "hours"],
      "benefits": ["benefits", "hr", "human resources"],
      "payroll": ["payroll", "salary", "compensation"],
      "technology": ["it", "technology", "support"],
      "training": ["training", "development", "learning"]
    };

    const enhancedKeywords = [
      ...keywords,
      ...(intentKeywords[intent as keyof typeof intentKeywords] || [])
    ];

    return enhancedKeywords.join(" ");
  }

  private calculateConfidence(keywords: string[], intent: string): number {
    // Basic confidence calculation
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on number of meaningful keywords
    confidence += Math.min(keywords.length * 0.1, 0.3);
    
    // Increase confidence for specific intents
    if (intent !== "general") {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  generateAnswer(question: string, searchResults: SearchResult[]): string {
    const processed = this.processQuestion(question);
    
    if (searchResults.length === 0) {
      return `I couldn't find specific information about "${processed.originalQuestion}". You might want to try rephrasing your question or contact your supervisor for assistance.`;
    }

    const topResult = searchResults[0];
    let answer = "";

    switch (processed.intent) {
      case "policy":
        answer = `Based on the available documents, here's what I found about ${processed.keywords.join(", ")}. Please check the "${topResult.title}" document for detailed policy information.`;
        break;
      case "procedure":
        answer = `I found procedure information that might help. The document "${topResult.title}" contains step-by-step guidance related to your question.`;
        break;
      case "contact":
        answer = `For contact information related to ${processed.keywords.join(", ")}, please refer to the "${topResult.title}" document which should contain the relevant contact details.`;
        break;
      default:
        answer = `I found ${searchResults.length} relevant document${searchResults.length > 1 ? 's' : ''} that might answer your question about ${processed.keywords.join(", ")}. Please review the documents below for detailed information.`;
    }

    return answer;
  }
}

export const nlpService = new NLPService();