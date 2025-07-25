# Employee Knowledge Agent Setup

This document explains how to configure and use the Employee Knowledge Agent feature.

## Overview

The Employee Knowledge Agent answers employee questions by searching:
- SharePoint sites and documents
- OneDrive files
- Internal wikis

It features:
- Natural language understanding
- Intelligent document search
- Teams integration
- Relevance-based results

## Configuration

### 1. Microsoft Graph API Setup

To enable SharePoint and OneDrive search, you need to register an Azure application:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Configure:
   - Name: "Employee Knowledge Agent"
   - Supported account types: "Single tenant"
   - Redirect URI: Not needed for client credentials flow

5. After creation, note the **Application (client) ID** and **Directory (tenant) ID**

6. Create a client secret:
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Note the **Value** (this is your client secret)

7. Configure API permissions:
   - Go to "API permissions"
   - Add the following Microsoft Graph **Application permissions**:
     - `Sites.Read.All` - Read SharePoint sites
     - `Files.Read.All` - Read OneDrive files
     - `Directory.Read.All` - Read directory (for user context)

8. Grant admin consent for the permissions

### 2. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
MICROSOFT_CLIENT_ID=your_application_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret_value
MICROSOFT_TENANT_ID=your_directory_tenant_id
```

### 3. Teams Integration (Optional)

To enable Teams bot functionality:

1. Go to [Teams Developer Portal](https://dev.teams.microsoft.com/)
2. Create a new app
3. Configure the bot:
   - Messaging endpoint: `https://yourdomain.com/api/teams/webhook`
   - Bot capabilities: Personal, Team, Group chat

4. Install the app in your Teams tenant

## Usage

### Web Interface

1. Login to the application
2. Navigate to "Knowledge Agent" in the header
3. Type your question in natural language
4. View the AI-generated answer and relevant documents

### Teams Bot

Once configured, users can:
1. Add the bot to Teams conversations
2. Ask questions directly in Teams
3. Receive answers with document links
4. Use adaptive cards for rich responses

## Features

### Natural Language Processing

The agent processes questions to:
- Extract keywords
- Identify intent (policy, procedure, contact, etc.)
- Generate optimized search queries
- Calculate confidence scores

### Search Sources

- **SharePoint**: Sites, lists, and documents
- **OneDrive**: Personal and shared files
- **Internal Wikis**: Mock implementation (customize for your wiki system)

### Response Generation

- Context-aware answers
- Relevance scoring
- Source attribution
- Confidence indicators

## Customization

### Adding Custom Search Sources

To add your own internal systems:

1. Create a new search function in `/lib/custom-search.ts`
2. Import and call it in `/app/api/agent/search/route.ts`
3. Format results to match the `SearchResult` interface

### Enhancing NLP

To improve natural language understanding:

1. Modify intent patterns in `/lib/nlp.ts`
2. Add domain-specific keywords
3. Customize answer templates

### Teams Bot Customization

Modify `/app/api/teams/webhook/route.ts` to:
- Add custom adaptive card designs
- Implement proactive messaging
- Add conversation state management

## Troubleshooting

### Common Issues

1. **"Failed to acquire access token"**
   - Check Azure app registration
   - Verify client secret is not expired
   - Ensure API permissions are granted

2. **"No search results"**
   - Verify user has access to SharePoint sites
   - Check search query generation
   - Review Graph API permissions

3. **Teams bot not responding**
   - Verify webhook endpoint is accessible
   - Check Teams app manifest
   - Review bot registration

### Logs

Check browser console and server logs for detailed error information.

## Security Considerations

- Client credentials are stored securely
- User authentication required for web interface
- Teams bot validates message origin
- Search results respect SharePoint permissions

## Limitations

- Requires Microsoft 365 tenant
- Limited to 10 search results per query
- Basic NLP implementation (can be enhanced)
- Mock wiki search (requires custom implementation)