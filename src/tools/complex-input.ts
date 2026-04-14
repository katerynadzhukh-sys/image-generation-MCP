import { z } from "zod";
import type { ToolDefinition } from "../server.js";

const inputSchema = z.object({
  customer: z.object({
    name: z.string().describe("Customer full name"),
    email: z.string().email().describe("Customer email address"),
  }),
  items: z
    .array(
      z.object({
        product: z.string().describe("Product name"),
        quantity: z.number().int().positive().describe("Number of items"),
      })
    )
    .min(1)
    .describe("List of items to order"),
  priority: z
    .enum(["low", "normal", "high"])
    .default("normal")
    .describe("Order priority level"),
  notes: z.string().optional().describe("Optional order notes"),
});

export const complexInputTool: ToolDefinition<typeof inputSchema.shape> = {
  name: "process_order",
  description:
    "Demonstrates a tool with a rich input schema: nested objects, enums, optional fields, and error handling.",
  inputSchema,
  handler: async ({ customer, items, priority, notes }) => {
    const totalQuantity = items.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0
    );
    if (totalQuantity > 100) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Order rejected: total quantity (${totalQuantity}) exceeds maximum of 100.`,
          },
        ],
        isError: true,
      };
    }

    const summary = [
      `Order placed for ${customer.name} (${customer.email})`,
      `Priority: ${priority}`,
      `Items:`,
      ...items.map(
        (i: { product: string; quantity: number }) =>
          `  - ${i.product} x${i.quantity}`
      ),
      notes ? `Notes: ${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      content: [{ type: "text" as const, text: summary }],
    };
  },
};
