import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { helloWorldTool } from "./tools/hello-world.js";
import { complexInputTool } from "./tools/complex-input.js";
import { asyncOperationTool } from "./tools/async-operation.js";
import { externalApiTool } from "./tools/external-api.js";
import { fileOperationTool } from "./tools/file-operation.js";
import { imageGenerationTool } from "./tools/image-generation-OpenAI.js";
import { imageEditTool } from "./tools/image-edit-OpenAI.js";

type TextContent = { type: "text"; text: string };
type ImageContent = { type: "image"; data: string; mimeType: "image/png" | "image/jpeg" | "image/webp" };

export interface ToolResult {
  [key: string]: unknown;
  content: (TextContent | ImageContent)[];
  isError?: boolean;
}

export interface ToolDefinition<T extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  description: string;
  inputSchema: z.ZodObject<T>;
  handler: (args: z.infer<z.ZodObject<T>>) => Promise<ToolResult>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tools: ToolDefinition<any>[] = [
  helloWorldTool,
  complexInputTool,
  asyncOperationTool,
  externalApiTool,
  fileOperationTool,
  imageGenerationTool,
  imageEditTool,
];

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mcp-blanko",
    version: "1.0.0",
  });

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.inputSchema.shape },
      tool.handler
    );
  }

  return server;
}
