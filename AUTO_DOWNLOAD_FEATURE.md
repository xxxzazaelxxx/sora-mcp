# 🎉 Auto-Download Feature Added!

## What's New

**New Tool: `save-video`** ⭐

Claude can now **automatically download** videos directly to your computer - no more manual curl commands needed!

## How It Works

### Before (Manual):
```
You: "Download video_123"
Claude: "Here's a curl command..."
You: *copies and pastes into terminal*
```

### Now (Automatic):
```
You: "Save video_123"
Claude: ✅ Downloads the video automatically to ~/Downloads/video_123.mp4
```

## Features

✅ **Automatic Download** - Claude downloads the file for you  
✅ **Custom Location** - Specify where to save via config  
✅ **Custom Filename** - Name your videos anything  
✅ **Smart Checking** - Only downloads when video is complete  
✅ **Auto-Create Folders** - Creates directories if they don't exist  

## Usage Examples

### Basic - Save to Downloads
```
"Save video video_123"
```
→ Saves to `~/Downloads/video_123.mp4`

### Custom Filename
```
"Save video video_123 as my-cat-video.mp4"
```
→ Saves to `~/Downloads/my-cat-video.mp4`

### Custom Location
```
"Save video video_123 to ~/Desktop"
```
→ Saves to `~/Desktop/video_123.mp4`

## Configuration

Your updated config at `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sora-server": {
      "command": "node",
      "args": ["/Users/pietroschirano/code/sora-mcp/dist/stdio-server.js"],
      "env": {
        "OPENAI_API_KEY": "sk-proj-...",
        "DOWNLOAD_DIR": "/Users/pietroschirano/Downloads"
      }
    }
  }
}
```

### Optional: Custom Download Folder

Want videos to go to a specific folder? Change `DOWNLOAD_DIR` to:
- `/Users/pietroschirano/Videos/Sora` - Custom Sora folder
- `/Users/pietroschirano/Desktop` - Desktop
- `/Users/pietroschirano/Movies` - Movies folder

## Complete Tool Set

Now you have **7 powerful tools**:

1. ✅ **create-video** - Generate videos
2. ✅ **get-video-status** - Check progress
3. ✅ **list-videos** - List all jobs
4. ✅ **download-video** - Get curl command (manual)
5. ✅ **save-video** - Auto-download (NEW!) ⭐
6. ✅ **remix-video** - Remix videos
7. ✅ **delete-video** - Delete videos

## Next Steps

1. **Restart Claude Desktop** (Cmd+Q then relaunch)
2. **Try it out:**
   ```
   "Create a video of a dog playing fetch"
   "Check status of that video"
   "Save it when it's ready"
   ```
3. **Find your video** in ~/Downloads!

## Full Workflow Example

```
You: "Create a 8-second video of waves crashing on a beach at sunset"
Claude: ✅ Video created! ID: video_abc123

You: "Check status of video_abc123"
Claude: Video is at 50% progress...

You: "Check again"
Claude: ✅ Video complete!

You: "Save that video as beach-sunset.mp4"
Claude: ✅ Downloaded to ~/Downloads/beach-sunset.mp4
```

Enjoy your fully automated video workflow! 🎬✨

