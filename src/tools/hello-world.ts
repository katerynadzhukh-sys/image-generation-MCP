import { z } from "zod";
import type { ToolDefinition } from "../server.js";

const inputSchema = z.object({
  name: z.string().describe("The name to greet"),
});

export const helloWorldTool: ToolDefinition<typeof inputSchema.shape> = {
  name: "hello_world",
  description: "A simple greeting tool. Takes a name and returns a personalized greeting.",
  inputSchema,
  handler: async ({ name }) => {
    return {
      content: [
        {
          type: "text" as const,
          text: `Hello, ${name}! Welcome to your MCP server.`,
        },
      ],
    };
  },
};
