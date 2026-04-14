import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServer } from "./server.js";
import { createServer as createHttpServer } from "node:http";

function getTransport(): "stdio" | "sse" {
  const fromArg = process.argv.find((a) => a.startsWith("--transport="));
  if (fromArg) return fromArg.split("=")[1] as "stdio" | "sse";
  if (process.env.MCP_TRANSPORT) return process.env.MCP_TRANSPORT as "stdio" | "sse";
  return "stdio";
}

async function main() {
  const transport = getTransport();
  const server = createServer();

  if (transport === "stdio") {
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    console.error("MCP server running on stdio");
  } else {
    const port = parseInt(process.env.MCP_PORT ?? "3001", 10);
    let sseTransport: SSEServerTransport | null = null;

    const httpServer = createHttpServer(async (req, res) => {
      if (req.method === "GET" && req.url === "/sse") {
        sseTransport = new SSEServerTransport("/messages", res);
        await server.connect(sseTransport);
      } else if (req.method === "POST" && req.url === "/messages") {
        if (sseTransport) {
          await sseTransport.handlePostMessage(req, res);
        } else {
          res.writeHead(400);
          res.end("No SSE connection established");
        }
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    httpServer.listen(port, () => {
      console.error(`MCP server running on http://localhost:${port}/sse`);
    });
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
