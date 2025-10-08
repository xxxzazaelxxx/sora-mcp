import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Get API key from environment (passed via Claude Desktop config)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    process.exit(1);
}

const SORA_API_BASE = 'https://api.openai.com/v1';

// Create MCP server
const server = new McpServer({
    name: 'sora-mcp-server',
    version: '1.0.0'
});

// Tool 1: Create Video
server.registerTool(
    'create-video',
    {
        title: 'Create Video',
        description: 'Generate a video using OpenAI Sora 2 API',
        inputSchema: {
            prompt: z.string().describe('Text prompt that describes the video to generate'),
            model: z.string().optional().default('sora-2').describe('The video generation model to use'),
            seconds: z.string().optional().default('4').describe('Clip duration in seconds'),
            size: z.string().optional().default('720x1280').describe('Output resolution formatted as width x height'),
            input_reference: z.string().optional().describe('Optional image or video file path for reference')
        },
        outputSchema: {
            id: z.string(),
            object: z.string(),
            model: z.string(),
            status: z.string(),
            progress: z.number(),
            created_at: z.number(),
            size: z.string(),
            seconds: z.string(),
            quality: z.string().optional()
        }
    },
    async ({ prompt, model = 'sora-2', seconds = '4', size = '720x1280', input_reference }) => {
        try {
            const formData = new FormData();
            formData.append('model', model);
            formData.append('prompt', prompt);
            formData.append('seconds', seconds);
            formData.append('size', size);

            // Handle input_reference if provided
            if (input_reference) {
                formData.append('input_reference', input_reference);
            }

            const response = await fetch(`${SORA_API_BASE}/videos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Sora API error: ${response.status} - ${errorText}`);
            }

            const output = await response.json() as Record<string, unknown>;

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(output, null, 2)
                    }
                ],
                structuredContent: output
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error creating video: ${errorMessage}`
                    }
                ],
                isError: true
            };
        }
    }
);

// Tool 2: Remix Video
server.registerTool(
    'remix-video',
    {
        title: 'Remix Video',
        description: 'Create a remix of an existing video using OpenAI Sora 2 API',
        inputSchema: {
            video_id: z.string().describe('The identifier of the completed video to remix'),
            prompt: z.string().describe('Updated text prompt that directs the remix generation')
        },
        outputSchema: {
            id: z.string(),
            object: z.string(),
            model: z.string(),
            status: z.string(),
            progress: z.number(),
            created_at: z.number(),
            size: z.string(),
            seconds: z.string(),
            remixed_from_video_id: z.string().optional()
        }
    },
    async ({ video_id, prompt }) => {
        try {
            const response = await fetch(`${SORA_API_BASE}/videos/${video_id}/remix`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Sora API error: ${response.status} - ${errorText}`);
            }

            const output = await response.json() as Record<string, unknown>;

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(output, null, 2)
                    }
                ],
                structuredContent: output
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error remixing video: ${errorMessage}`
                    }
                ],
                isError: true
            };
        }
    }
);

// Resource: Video Status
server.registerResource(
    'video-status',
    new ResourceTemplate('video://{video_id}', { list: undefined }),
    {
        title: 'Video Status',
        description: 'Get the status and details of a video generation job',
        mimeType: 'application/json'
    },
    async (uri, { video_id }) => {
        try {
            const response = await fetch(`${SORA_API_BASE}/videos/${video_id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Sora API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            return {
                contents: [
                    {
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(data, null, 2)
                    }
                ]
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                contents: [
                    {
                        uri: uri.href,
                        mimeType: 'text/plain',
                        text: `Error fetching video status: ${errorMessage}`
                    }
                ]
            };
        }
    }
);

// Connect with stdio transport for Claude Desktop
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Sora MCP Server running via stdio');

