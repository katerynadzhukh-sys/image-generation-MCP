import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import type { ToolDefinition } from "../server.js";

const inputSchema = z.object({
  action: z.enum(["read", "write"]).describe("Whether to read or write"),
  filePath: z
    .string()
    .describe("Relative file path within the working directory"),
  content: z
    .string()
    .optional()
    .describe("Content to write (required for write action)"),
});

export const fileOperationTool: ToolDefinition<typeof inputSchema.shape> = {
  name: "manage_file",
  description:
    "Demonstrates reading and writing local files. Operates within a configurable base directory.",
  inputSchema,
  handler: async ({ action, filePath, content }) => {
    const baseDir = process.env.MCP_FILES_DIR ?? process.cwd();
    const fullPath = resolve(baseDir, filePath);

    // Prevent path traversal
    if (!fullPath.startsWith(resolve(baseDir))) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: path traversal is not allowed.",
          },
        ],
        isError: true,
      };
    }

    if (action === "read") {
      try {
        const data = await readFile(fullPath, "utf-8");
        return {
          content: [{ type: "text" as const, text: data }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error reading file: ${(err as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }

    // action === "write"
    if (content === undefined) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: content is required for write action.",
          },
        ],
        isError: true,
      };
    }

    try {
      await writeFile(fullPath, content, "utf-8");
      return {
        content: [
          {
            type: "text" as const,
            text: `File written successfully: ${filePath}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error writing file: ${(err as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  },
};
