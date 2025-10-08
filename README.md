# Sora MCP Server

A Model Context Protocol (MCP) server that integrates with OpenAI's Sora 2 API for video generation and remixing.

## Features

- **Create Videos**: Generate videos from text prompts using Sora 2
- **Remix Videos**: Create variations of existing videos with new prompts
- **Video Status**: Check the status and progress of video generation jobs

## Prerequisites

- Node.js 18+ 
- OpenAI API key with Sora access
- An MCP-compatible client (Claude, Cursor, VS Code, etc.)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sora-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your OpenAI API key:
```bash
OPENAI_API_KEY=sk-your-api-key-here
PORT=3000
```

## Usage

### For Claude Desktop (stdio mode)

Claude Desktop will automatically start the server when configured. Just make sure:
1. Your `.env` file has your `OPENAI_API_KEY`
2. Restart Claude Desktop after updating the config

The config uses `src/stdio-server.ts` which communicates via stdio.

### For HTTP Mode (MCP Inspector, web clients)

Run the server in development mode with auto-reload:

```bash
npm run dev
```

Or in production mode:

```bash
npm run build
npm start
```

## Connecting to MCP Clients

### Claude Desktop

The server is already configured! 

**Setup:**
The configuration is at: `~/Library/Application Support/Claude/claude_desktop_config.json`

It uses the compiled server and passes your API key via environment variables:
```json
{
  "mcpServers": {
    "sora-server": {
      "command": "node",
      "args": ["/Users/pietroschirano/code/sora-mcp/dist/stdio-server.js"],
      "env": {
        "OPENAI_API_KEY": "sk-proj-..."
      }
    }
  }
}
```

**To use:**
1. Restart Claude Desktop (Cmd+Q then relaunch)
2. The Sora tools will appear automatically!

### MCP Inspector (for testing)

Test your server with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector
```

Then connect to: `http://localhost:3000/mcp`

### Claude Code

```bash
claude mcp add --transport http sora-server http://localhost:3000/mcp
```

### VS Code

```bash
code --add-mcp '{"name":"sora-server","type":"http","url":"http://localhost:3000/mcp"}'
```

### Cursor

Click this deeplink or add manually in settings:
```
cursor://anysphere.cursor-deeplink/mcp/install?name=sora-server&config=eyJ1cmwiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvbWNwIn0%3D
```

## Available Tools

### create-video

Generate a video from a text prompt.

**Parameters:**
- `prompt` (required): Text description of the video to generate
- `model` (optional): Model to use (default: "sora-2")
- `seconds` (optional): Video duration in seconds (default: "4")
- `size` (optional): Resolution as "widthxheight" (default: "720x1280")
- `input_reference` (optional): Path to reference image/video

**Example:**
```javascript
{
  "prompt": "A calico cat playing a piano on stage",
  "model": "sora-2",
  "seconds": "8",
  "size": "1024x1808"
}
```

### remix-video

Create a remix of an existing video with a new prompt.

**Parameters:**
- `video_id` (required): ID of the completed video to remix
- `prompt` (required): New text prompt for the remix

**Example:**
```javascript
{
  "video_id": "video_123",
  "prompt": "Extend the scene with the cat taking a bow to the cheering audience"
}
```

## Available Resources

### video://{video_id}

Get the current status and details of a video generation job.

**Example URI:** `video://video_123`

Returns job status, progress, and download URL when complete.

## API Response Format

### Video Job Response

```json
{
  "id": "video_123",
  "object": "video",
  "model": "sora-2",
  "status": "queued",
  "progress": 0,
  "created_at": 1712697600,
  "size": "1024x1808",
  "seconds": "8",
  "quality": "standard"
}
```

### Remix Response

```json
{
  "id": "video_456",
  "object": "video",
  "model": "sora-2",
  "status": "queued",
  "progress": 0,
  "created_at": 1712698600,
  "size": "720x1280",
  "seconds": "8",
  "remixed_from_video_id": "video_123"
}
```

## Error Handling

The server includes comprehensive error handling:

- Missing API key validation on startup
- API error responses with detailed messages
- Graceful error returns in tool responses

## Development

### Project Structure

```
sora-mcp/
├── src/
│   └── server.ts       # Main server implementation
├── dist/               # Compiled JavaScript (generated)
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── .env               # Environment variables (not in git)
└── README.md          # This file
```

### Scripts

- `npm run dev` - Run in development mode with tsx
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript

## Environment Variables

- `OPENAI_API_KEY` (required) - Your OpenAI API key
- `PORT` (optional) - Server port (default: 3000)

## License

MIT

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [OpenAI Sora API Documentation](https://platform.openai.com/docs/api-reference/videos)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

