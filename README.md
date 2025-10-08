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

## Server Architecture

This project includes **two server implementations** for different use cases:

### 📱 `stdio-server.ts` - For Claude Desktop
- **Transport:** stdio (Standard Input/Output)
- **Use case:** Local process communication
- **How it works:** Claude Desktop spawns this as a child process
- **Benefits:** Fast, secure, no network needed
- **Used by:** Claude Desktop

### 🌐 `server.ts` - For Remote Access
- **Transport:** HTTP/Streamable HTTP  
- **Use case:** Remote clients, web-based tools
- **How it works:** Runs as HTTP server on port 3000
- **Benefits:** Network accessible, multiple clients
- **Used by:** MCP Inspector, VS Code, Cursor, browsers

**Why two servers?** Different MCP clients use different transports. This separation keeps the code clean and optimized for each transport type.

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
        "OPENAI_API_KEY": "sk-proj-...",
        "DOWNLOAD_DIR": "/Users/you/Videos/Sora"
      }
    }
  }
}
```

**Environment Variables:**
- `OPENAI_API_KEY` (required) - Your OpenAI API key
- `DOWNLOAD_DIR` (optional) - Custom download folder (defaults to ~/Downloads)

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

### get-video-status

Check the status and progress of a video generation job.

**Parameters:**
- `video_id` (required): ID of the video to check

**Example:**
```javascript
{
  "video_id": "video_123"
}
```

**Returns:** Video status including `progress` (0-100), `status` (queued/processing/completed), and completion timestamps.

### list-videos

List all your video generation jobs with pagination.

**Parameters:**
- `limit` (optional): Number of videos to retrieve (default: 20)
- `after` (optional): Pagination cursor - get videos after this ID
- `order` (optional): Sort order "asc" or "desc" (default: "desc")

**Example:**
```javascript
{
  "limit": 10,
  "order": "desc"
}
```

### download-video

Get a curl command to manually download a completed video.

**Parameters:**
- `video_id` (required): ID of the video to download
- `variant` (optional): Which format to download (defaults to MP4)

**Example:**
```javascript
{
  "video_id": "video_123"
}
```

**Returns:** Ready-to-use curl command with authentication for downloading the video.

### save-video ⭐ (Auto-Download)

Automatically download and save a completed video to your computer.

**Parameters:**
- `video_id` (required): ID of the video to save
- `output_path` (optional): Directory to save to (defaults to ~/Downloads)
- `filename` (optional): Custom filename (defaults to video_id.mp4)

**Example:**
```javascript
{
  "video_id": "video_123",
  "filename": "my-cat-video.mp4"
}
```

**Returns:** File path where video was saved. No manual commands needed!

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

### delete-video

Delete a video job and its assets.

**Parameters:**
- `video_id` (required): ID of the video to delete

**Example:**
```javascript
{
  "video_id": "video_123"
}
```

## Typical Workflow

1. **Create a video** → Get back a `video_id`
   ```
   "Create a video of a sunset over mountains"
   ```

2. **Check status** → Monitor progress
   ```
   "Check the status of video video_123"
   ```

3. **Save when ready** → Auto-download the video file
   ```
   "Save video video_123"
   ```
   Claude will automatically download it to your Downloads folder!

4. **Clean up** → Delete old videos
   ```
   "Delete video video_123"
   ```

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

