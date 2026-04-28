import OpenAI from "openai";
import { z } from "zod";
import type { ToolDefinition } from "../server.js";

const inputSchema = z.object({
  prompt: z.string().describe("Text description of the image to generate"),
  size: z
    .enum(["1024x1024", "1536x1024", "1024x1536", "auto"])
    .default("1024x1024")
    .describe("Image size"),
  quality: z
    .enum(["low", "medium", "high", "auto"])
    .default("auto")
    .describe("Image quality: low, medium, high or auto"),
  n: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(1)
    .describe("Number of images to generate (1-10)"),
  background: z
    .enum(["transparent", "opaque", "auto"])
    .default("auto")
    .optional()
    .describe("Background behavior for the generated image: transparent, opaque or auto"),
});

export const imageGenerationTool: ToolDefinition<typeof inputSchema.shape> = {
  name: "generate_image",
  description:
    "Generates images from a text description using gpt-image-1 by OpenAI. Returns base64-encoded PNG images.",
  inputSchema,
  handler: async ({ prompt, size, quality, n, background }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: OPENAI_API_KEY environment variable is not set.",
          },
        ],
        isError: true,
      };
    }

    const client = new OpenAI({ apiKey });

    try {
      const response = await client.images.generate({
        model: "gpt-image-1",
        prompt,
        size: size as "1024x1024" | "1536x1024" | "1024x1536" | "auto",
        quality: quality as "low" | "medium" | "high" | "auto",
        background: background as "transparent" | "opaque" | "auto" | undefined,
        n,
      });

      const content = (response.data ?? []).map((img) => ({
        type: "image" as const,
        data: img.b64_json ?? "",
        mimeType: "image/png" as const,
      }));

      return { content };
    } catch (err) {
      const message = err instanceof OpenAI.APIError
        ? `OpenAI API error ${err.status}: ${err.message}`
        : `Unexpected error: ${(err as Error).message}`;

      return {
        content: [{ type: "text" as const, text: message }],
        isError: true,
      };
    }
  },
};
