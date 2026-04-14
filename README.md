# mcp-blanko

A template for building your own [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server in TypeScript.

Includes placeholder tools, dual transport support (stdio + SSE), and a simple pattern for adding your own tools.

## Quick Start

```bash
npm install
npm run build
npm start
```

## Project Structure

```
src/
├── index.ts          # Entry point — transport selection
├── server.ts         # Server setup & tool registration
└── tools/
    ├── hello-world.ts      # Simple greeting tool
    ├── complex-input.ts    # Rich input schema with error handling
    ├── async-operation.ts  # Simulated long-running task
    ├── external-api.ts     # Placeholder for API integration
    └── file-operation.ts   # Local file read/write
```

## Adding Your Own Tool

1. Create a new file in `src/tools/`:

```typescript
import { z } from "zod";
import type { ToolDefinition } from "../server.js";

export const myTool: ToolDefinition = {
  name: "my_tool",
  description: "What this tool does",
  inputSchema: z.object({
    param: z.string().describe("Description of param"),
  }),
  handler: async ({ param }) => {
    return {
      content: [{ type: "text", text: `Result: ${param}` }],
    };
  },
};
```

2. Register it in `src/server.ts`:

```typescript
import { myTool } from "./tools/my-tool.js";

const tools: ToolDefinition[] = [
  // ... existing tools
  myTool,
];
```

3. Build and run:

```bash
npm run build && npm start
```

## Transport Modes

### stdio (default)

```bash
npm start
# or
npm run start:stdio
```

### SSE (HTTP)

```bash
npm run start:sse
# or
MCP_PORT=3001 node dist/index.js --transport=sse
```

The SSE endpoint will be available at `http://localhost:3001/sse`.

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-blanko": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-blanko/dist/index.js"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add mcp-blanko node /absolute/path/to/mcp-blanko/dist/index.js
```

## Docker Deployment

Build and run with Docker Compose:

```bash
docker compose up -d
```

The SSE endpoint will be available at `http://localhost:3001/sse`. Put a reverse proxy (e.g., nginx, Caddy, Traefik) in front for HTTPS.

Or build and run manually:

```bash
docker build -t mcp-blanko .
docker run -d -p 3001:3001 mcp-blanko
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_TRANSPORT` | `stdio` | Transport mode: `stdio` or `sse` |
| `MCP_PORT` | `3001` | HTTP port for SSE transport |
| `MCP_FILES_DIR` | `cwd` | Base directory for the file operation tool |

## License

MIT
