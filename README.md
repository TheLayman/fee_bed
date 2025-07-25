# Employee Knowledge Agent - Jagannatha Group B.Ed Colleges

This application provides both student fee management and an intelligent Employee Knowledge Agent that answers employee questions by searching SharePoint, OneDrive, and internal wikis.

## Features

### Employee Knowledge Agent
- **Natural Language Understanding**: Processes questions in plain English
- **Multi-Source Search**: Searches SharePoint sites, OneDrive files, and internal wikis
- **Teams Integration**: Works as a Teams bot for instant answers
- **Relevance Scoring**: Provides most relevant documents first
- **Source Attribution**: Shows where information comes from

### Fee Management System
- Student fee tracking and management
- Transaction recording and reporting
- User authentication and role management
- Admin approval workflows

## Local Development

### Prerequisites
1. Node.js 18+ and npm
2. PostgreSQL database (for fee management)
3. Microsoft 365 tenant (for agent functionality)

### Installation

```bash
npm install
```

### Configuration

1. Copy environment variables:
```bash
cp .env.example .env.local
```

2. Configure your environment variables:
- For fee management: Set `DATABASE_URL`
- For agent functionality: Set Microsoft Graph API credentials
- For Teams bot: Configure Teams app settings

### Running the Application

```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

The site runs at `http://localhost:3000`.

## Employee Knowledge Agent Setup

The agent requires Microsoft Graph API configuration to search SharePoint and OneDrive. See [AGENT_SETUP.md](./AGENT_SETUP.md) for detailed configuration instructions.

### Quick Start (Demo Mode)
The agent includes mock wiki results that work without Microsoft Graph configuration. You can test the interface immediately:

1. Start the development server
2. Login to the application
3. Navigate to "Knowledge Agent" in the header
4. Ask questions like "How do I reset my password?" or "What is the vacation policy?"

### Production Setup
For full functionality with SharePoint and OneDrive:

1. Register an Azure application
2. Configure Microsoft Graph permissions
3. Set environment variables
4. Deploy to your preferred platform

## Usage

### Web Interface
1. Login with your credentials
2. Click "Knowledge Agent" in the navigation
3. Type your question in natural language
4. View AI-generated answers and relevant documents

### Teams Bot (Optional)
Once configured, employees can ask questions directly in Teams and receive instant answers with document links.

## API Endpoints

### Agent API
- `POST /api/agent/search` - Search for answers to employee questions
- `POST /api/teams/webhook` - Teams bot webhook endpoint

### Fee Management API
- Various endpoints for student and transaction management
- See existing documentation for fee management features

## Architecture

### Natural Language Processing
- Keyword extraction and intent recognition
- Query optimization for different document sources
- Confidence scoring for answer quality

### Search Integration
- **SharePoint**: Sites, lists, and document libraries
- **OneDrive**: Personal and shared files
- **Internal Wikis**: Customizable mock implementation

### Teams Integration
- Webhook-based bot responses
- Adaptive cards for rich document presentation
- Proactive messaging capabilities

## Customization

### Adding Custom Search Sources
1. Create a new search service in `/lib/`
2. Integrate with the agent API in `/app/api/agent/search/route.ts`
3. Update the UI to display new source types

### Enhancing NLP
- Modify intent patterns in `/lib/nlp.ts`
- Add domain-specific keywords and responses
- Implement advanced natural language models

## Security

- Requires user authentication for all agent features
- Respects SharePoint and OneDrive permissions
- Teams bot validates message origins
- Environment variables for sensitive configuration

## License

MIT
