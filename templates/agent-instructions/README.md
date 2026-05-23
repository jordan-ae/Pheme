# Agent instruction templates

Drop these files into the **root of any repo** that should use Project Memory. They are not branch-diverged because they point to the memory server (a live process), not a file in git.

| File | Agent | Notes |
|---|---|---|
| `CLAUDE.md` | Claude Code | Auto-loaded at session start. |
| `.cursorrules` | Cursor | Auto-loaded by Cursor. |
| `.windsurfrules` | Windsurf | Auto-loaded by Windsurf. |
| `.github/copilot-instructions.md` | GitHub Copilot | Read by Copilot when in repo. |

## MCP server configuration

Claude Code, Cursor, and Windsurf need the `phemesh-memory` MCP server registered. Example for Claude Code (`~/.claude/settings.json` or project-level `.mcp.json`):

```json
{
  "mcpServers": {
    "phemesh-memory": {
      "command": "node",
      "args": ["/absolute/path/to/phemesh/packages/memory-mcp/dist/index.js"],
      "env": {
        "MEMORY_SERVER_URL": "http://localhost:4000",
        "MEMORY_API_KEY": "<paste your key here>"
      }
    }
  }
}
```

In development, swap to `tsx`:

```json
"command": "tsx",
"args": ["/absolute/path/to/phemesh/packages/memory-mcp/src/index.ts"]
```

Once `memory-mcp` is published or linked globally, this simplifies to:

```json
"command": "npx",
"args": ["-y", "memory-mcp"]
```
