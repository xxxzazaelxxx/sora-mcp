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

// Tool 3: Get Video Status
server.registerTool(
    'get-video-status',
    {
        title: 'Get Video Status',
        description: 'Check the status and details of a video generation job',
        inputSchema: {
            video_id: z.string().describe('The identifier of the video to check')
        },
        outputSchema: {
            id: z.string(),
            object: z.string(),
            model: z.string(),
            status: z.string(),
            progress: z.number(),
            created_at: z.number(),
            completed_at: z.number().nullable().optional(),
            expires_at: z.number().nullable().optional(),
            size: z.string(),
            seconds: z.string()
        }
    },
    async ({ video_id }) => {
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
                        text: `Error getting video status: ${errorMessage}`
                    }
                ],
                isError: true
            };
        }
    }
);

// Tool 4: List Videos
server.registerTool(
    'list-videos',
    {
        title: 'List Videos',
        description: 'List all video generation jobs with pagination support',
        inputSchema: {
            limit: z.number().optional().default(20).describe('Number of videos to retrieve'),
            after: z.string().optional().describe('Identifier for pagination - get videos after this ID'),
            order: z.enum(['asc', 'desc']).optional().default('desc').describe('Sort order by timestamp')
        },
        outputSchema: {
            data: z.array(z.record(z.any())),
            object: z.string()
        }
    },
    async ({ limit = 20, after, order = 'desc' }) => {
        try {
            const params = new URLSearchParams();
            params.append('limit', String(limit));
            if (after) params.append('after', after);
            params.append('order', order);

            const response = await fetch(`${SORA_API_BASE}/videos?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
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
                        text: `Error listing videos: ${errorMessage}`
                    }
                ],
                isError: true
            };
        }
    }
);

// Tool 5: Download Video
server.registerTool(
    'download-video',
    {
        title: 'Download Video',
        description: 'Get the download instructions and authenticated URL for a completed video',
        inputSchema: {
            video_id: z.string().describe('The identifier of the video to download'),
            variant: z.string().optional().describe('Which downloadable asset to return (defaults to MP4)')
        },
        outputSchema: {
            video_id: z.string(),
            status: z.string(),
            message: z.string(),
            download_instructions: z.string(),
            curl_command: z.string()
        }
    },
    async ({ video_id, variant }) => {
        try {
            // First check if video is completed
            const statusResponse = await fetch(`${SORA_API_BASE}/videos/${video_id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
            });

            if (!statusResponse.ok) {
                const errorText = await statusResponse.text();
                throw new Error(`Sora API error: ${statusResponse.status} - ${errorText}`);
            }

            const statusData = await statusResponse.json() as { status: string };

            if (statusData.status !== 'completed') {
                const output = {
                    video_id,
                    status: statusData.status,
                    message: `Video is not ready yet. Current status: ${statusData.status}`,
                    download_instructions: 'Video is not ready for download yet.',
                    curl_command: ''
                };
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(output, null, 2)
                        }
                    ],
                    structuredContent: output
                };
            }

            // Video is completed, provide download instructions
            const params = variant ? `?variant=${variant}` : '';
            const downloadUrl = `${SORA_API_BASE}/videos/${video_id}/content${params}`;
            
            const curlCommand = `curl -H "Authorization: Bearer ${OPENAI_API_KEY}" "${downloadUrl}" -o "${video_id}.mp4"`;
            
            const output = {
                video_id,
                status: 'completed',
                message: 'Video is ready for download! Use the curl command below to download it.',
                download_instructions: 'The video requires authentication. Use the provided curl command or add Authorization header with your API key.',
                curl_command: curlCommand
            };

            return {
                content: [
                    {
                        type: 'text',
                        text: `Video ${video_id} is ready for download!\n\nTo download the video, run this command in your terminal:\n\n${curlCommand}\n\nThis will save the video as "${video_id}.mp4" in your current directory.`
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
                        text: `Error preparing video download: ${errorMessage}`
                    }
                ],
                isError: true
            };
        }
    }
);

// Tool 6: Delete Video
server.registerTool(
    'delete-video',
    {
        title: 'Delete Video',
        description: 'Delete a video job and its assets',
        inputSchema: {
            video_id: z.string().describe('The identifier of the video to delete')
        },
        outputSchema: {
            id: z.string(),
            deleted: z.boolean(),
            message: z.string()
        }
    },
    async ({ video_id }) => {
        try {
            const response = await fetch(`${SORA_API_BASE}/videos/${video_id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Sora API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json() as Record<string, unknown>;

            const output = {
                id: video_id,
                deleted: true,
                message: `Successfully deleted video ${video_id}`,
                ...data
            };

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
                        text: `Error deleting video: ${errorMessage}`
                    }
                ],
                isError: true
            };
        }
    }
);

// Connect with stdio transport for Claude Desktop
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Sora MCP Server running via stdio');

