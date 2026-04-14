import { z } from "zod";
import type { ToolDefinition } from "../server.js";

const inputSchema = z.object({
  endpoint: z.string().describe("API endpoint path (e.g., /users/123)"),
  method: z
    .enum(["GET", "POST", "PUT", "DELETE"])
    .default("GET")
    .describe("HTTP method"),
});

export const externalApiTool: ToolDefinition<typeof inputSchema.shape> = {
  name: "fetch_data",
  description:
    "Placeholder for a tool that calls an external API. Replace the handler with your own API logic.",
  inputSchema,
  handler: async ({ endpoint, method }) => {
    // TODO: Replace this with a real API call.
    //
    // Example using fetch:
    //
    //   const BASE_URL = process.env.API_BASE_URL ?? "https://api.example.com";
    //   const response = await fetch(`${BASE_URL}${endpoint}`, { method });
    //   const data = await response.json();
    //
    //   return {
    //     content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    //   };

    return {
      content: [
        {
          type: "text" as const,
          text: [
            `[Placeholder] Would call ${method} ${endpoint}`,
            "",
            "Replace this handler with your actual API integration.",
            "See the TODO comment in src/tools/external-api.ts for an example.",
          ].join("\n"),
        },
      ],
    };
  },
};
