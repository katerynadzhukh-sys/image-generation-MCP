import { z } from "zod";
import type { ToolDefinition } from "../server.js";

const inputSchema = z.object({
  taskName: z.string().describe("Name of the task to run"),
  durationMs: z
    .number()
    .int()
    .min(100)
    .max(5000)
    .default(1000)
    .describe("Simulated duration in milliseconds (100-5000)"),
});

export const asyncOperationTool: ToolDefinition<typeof inputSchema.shape> = {
  name: "long_running_task",
  description:
    "Demonstrates an async tool that simulates a long-running operation (e.g., data processing, report generation).",
  inputSchema,
  handler: async ({ taskName, durationMs }) => {
    const startTime = Date.now();

    await new Promise<void>((resolve) => setTimeout(resolve, durationMs));

    const elapsed = Date.now() - startTime;

    return {
      content: [
        {
          type: "text" as const,
          text: `Task "${taskName}" completed in ${elapsed}ms.`,
        },
      ],
    };
  },
};
