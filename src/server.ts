import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { helloWorldTool } from "./tools/hello-world.js";
import { complexInputTool } from "./tools/complex-input.js";
import { asyncOperationTool } from "./tools/async-operation.js";
import { externalApiTool } from "./tools/external-api.js";
import { fileOperationTool } from "./tools/file-operation.js";

export interface ToolResult {
  [key: string]: unknown;
  content: { type: "text"; text: string }[];
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
];

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mcp-blanko",
    version: "1.0.0",
  });

  // Register all tools
  for (const tool of tools) {
    server.tool(tool.name, tool.description, tool.inputSchema.shape, tool.handler);
  }

  return server;
}
