# Quick Setup Guide for Claude Desktop

## ✅ What's Done

1. ✅ Sora MCP Server created with both HTTP and stdio support
2. ✅ Claude Desktop config created at `claude_desktop_config.json`
3. ✅ dotenv installed for loading `.env` file
4. ✅ TypeScript compiled successfully

## 🚀 Final Steps

### 1. Verify your `.env` file

Make sure you have a `.env` file in this directory with your OpenAI API key:

```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

If you don't have it yet, create it:
```bash
echo "OPENAI_API_KEY=sk-proj-your-key-here" > .env
```

### 2. Copy config to Claude Desktop

Claude Desktop looks for its config in a specific location. Copy your config file there:

**On macOS:**
```bash
# Create the directory if it doesn't exist
mkdir -p ~/Library/Application\ Support/Claude/

# Copy the config
cp /Users/pietroschirano/code/sora-mcp/claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**OR manually:**
1. Open `~/Library/Application Support/Claude/claude_desktop_config.json` in an editor
2. Add the sora-server configuration from `claude_desktop_config.json`

### 3. Restart Claude Desktop

1. Quit Claude Desktop completely
2. Relaunch it
3. The Sora tools should now be available!

## 🧪 Testing

### Test with MCP Inspector first (recommended):

```bash
npx @modelcontextprotocol/inspector /Users/pietroschirano/code/sora-mcp/src/stdio-server.ts
```

This will open a web interface where you can test the tools before using them in Claude.

### Available Tools in Claude:

Once configured, you can ask Claude to:
- **Create videos**: "Create a video of a cat playing piano"
- **Remix videos**: "Remix video_123 to show the cat taking a bow"
- **Check status**: Read resource `video://video_123` to see generation progress

## 🔧 Troubleshooting

**If tools don't appear:**
1. Check Claude Desktop logs: `~/Library/Logs/Claude/mcp*.log`
2. Verify your `.env` file has the correct API key
3. Make sure the config path is correct: `/Users/pietroschirano/code/sora-mcp/src/stdio-server.ts`
4. Try running manually: `npx tsx /Users/pietroschirano/code/sora-mcp/src/stdio-server.ts`

**API Key errors:**
- Ensure your OpenAI API key has Sora access
- Check the key starts with `sk-`
- No quotes needed in `.env` file

## 📁 Your Config

Your current Claude Desktop config:
```json
{
  "mcpServers": {
    "sora-server": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/Users/pietroschirano/code/sora-mcp/src/stdio-server.ts"
      ]
    }
  }
}
```

This will automatically load your `.env` file and start the server when Claude needs it!

