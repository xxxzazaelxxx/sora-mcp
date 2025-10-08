# Final Setup Step

## ⚠️ IMPORTANT: Add Your API Key

You need to edit the Claude Desktop config and replace the placeholder with your actual OpenAI API key.

### Quick Fix:

Open this file in your editor:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

And replace `REPLACE_WITH_YOUR_ACTUAL_API_KEY` with your actual OpenAI API key (starts with `sk-`).

### Or use this command:

```bash
# Open in default editor
open -e ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### The config should look like this:

```json
{
  "mcpServers": {
    "sora-server": {
      "command": "node",
      "args": [
        "/Users/pietroschirano/code/sora-mcp/dist/stdio-server.js"
      ],
      "env": {
        "OPENAI_API_KEY": "sk-proj-YOUR-ACTUAL-KEY-HERE"
      }
    }
  }
}
```

## After updating:

1. **Save the file**
2. **Restart Claude Desktop** (Cmd+Q then relaunch)
3. **Test it!** Ask Claude: "What tools do you have available?"

You should see:
- **Create Video** - Generate videos using Sora 2
- **Remix Video** - Remix existing videos

✨ That's it! Your Sora MCP server is ready!

