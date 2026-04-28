import OpenAI, { toFile } from "openai";
import { z } from "zod";
import type { ToolDefinition } from "../server.js";

const inputSchema = z.object({
  image: z.string().describe("Base64-encoded PNG image to edit"),
  prompt: z.string().describe("Text description of the desired edit"),
  mask: z
    .string()
    .optional()
    .describe("Base64-encoded PNG mask image — transparent areas indicate where to apply the edit"),
  size: z
    .enum(["1024x1024", "1536x1024", "1024x1536", "auto"])
    .default("1024x1024")
    .describe("Output image size"),
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
    .describe("Number of output images to generate (1-10)"),
  background: z
    .enum(["transparent", "opaque", "auto"])
    .default("auto")
    .optional()
    .describe("Background behavior for the output image: transparent, opaque or auto"),
});

export const imageEditTool: ToolDefinition<typeof inputSchema.shape> = {
  name: "edit_image",
  description:
    "Edits an existing image based on a text prompt using gpt-image-1 by OpenAI. Optionally accepts a mask to restrict the edit area. Returns base64-encoded PNG images.",
  inputSchema,
  handler: async ({ image, prompt, mask, size, quality, n, background }) => {
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

    let imageFile: Awaited<ReturnType<typeof toFile>>;
    try {
      imageFile = await toFile(Buffer.from(image, "base64"), "image.png", {
        type: "image/png",
      });
    } catch {
      return {
        content: [{ type: "text" as const, text: "Error: invalid base64 string in 'image' field." }],
        isError: true,
      };
    }

    let maskFile: Awaited<ReturnType<typeof toFile>> | undefined;
    if (mask) {
      try {
        maskFile = await toFile(Buffer.from(mask, "base64"), "mask.png", { type: "image/png" });
      } catch {
        return {
          content: [{ type: "text" as const, text: "Error: invalid base64 string in 'mask' field." }],
          isError: true,
        };
      }
    }

    try {
      const response = await client.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt,
        ...(maskFile && { mask: maskFile }),
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
