#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getContext, searchMemory, logEntry } from "./client.js";

const server = new McpServer(
  {
    name: "phemesh-memory",
    version: "0.0.1",
  },
  {
    // Returned in the MCP InitializeResponse `instructions` field (SRS §3.1).
    // MCP-compatible agents fold this into their system prompt automatically,
    // which is what replaces committed instruction files for native agents.
    instructions:
      "Project Memory is connected. Before starting any task, call get_context with the current git " +
      "branch and the files you plan to touch, and call list_open_questions to check for blockers. " +
      "Treat every constraint returned in the bundle as non-negotiable. Surface any open question that " +
      "touches your task before writing code. Use search_memory mid-task whenever you hit an unfamiliar " +
      "choice in the code. When you make a non-trivial decision, accept a trade-off, or discover a new " +
      "constraint or open question, record it with log_entry before you finish.",
  },
);

const entryType = z.enum(["decision", "tradeoff", "question", "constraint"]);

server.tool(
  "get_context",
  "Retrieve the right-sized project memory bundle for the current task. " +
    "Constraints are always included in full. Other entries are truncated by relevance to fit the token budget. " +
    "Call this at the start of every task before writing code.",
  {
    branch: z
      .string()
      .optional()
      .describe("Git branch name (defaults to 'global'). Determines feature-scope chain."),
    files: z
      .array(z.string())
      .optional()
      .describe("File paths the task will touch. Entries with overlapping tags are prioritised."),
    types: z
      .array(entryType)
      .optional()
      .describe("Filter to specific entry types. Default: all four."),
    maxTokens: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Cap on bundle size (excluding constraints). Default 3000, max 10000."),
  },
  async (args) => {
    const data = await getContext(args);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
);

server.tool(
  "search_memory",
  "Semantic search over all active memory entries. Use mid-task when you encounter " +
    "unfamiliar code or unexpected patterns and want context for the specific thing you're confused about.",
  {
    query: z.string().describe("Natural-language description of what you're looking for."),
    limit: z.number().int().positive().max(20).optional().describe("Max results (default 5)."),
    minSimilarity: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe("Minimum cosine similarity (default 0.2)."),
  },
  async ({ query, limit, minSimilarity }) => {
    const data = await searchMemory(query, limit, minSimilarity);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
);

server.tool(
  "log_entry",
  "Record a new entry in project memory. Use this for decisions you made during the task, " +
    "trade-offs you accepted, open questions you discovered, or constraints surfaced by humans. " +
    "Rationale is the most important field — future agents rely on it.",
  {
    type: entryType.describe("Kind of entry."),
    title: z.string().describe("One sentence, present tense. What was decided or established."),
    body: z.string().describe("Full explanation of the entry."),
    rationale: z
      .string()
      .optional()
      .describe("Why. The single most important field for future agents."),
    author: z.string().optional().describe("Person or agent identifier. Defaults to caller."),
    branch: z.string().optional().describe("Git branch (defaults to global)."),
    scope: z
      .enum(["global", "feature", "spike", "archived"])
      .optional()
      .describe("Promotion scope. Feature-scoped entries are reviewed at merge time."),
    tags: z.array(z.string()).optional().describe("Tags for retrieval (file paths, topics)."),
  },
  async (args) => {
    const result = await logEntry(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
);

server.tool(
  "list_open_questions",
  "List unresolved open questions. Use before starting a task to check whether your work " +
    "touches a known blocker.",
  {
    branch: z
      .string()
      .optional()
      .describe("Git branch (defaults to 'global'). Includes global + branch-scoped questions."),
  },
  async ({ branch }) => {
    const data = await getContext({ branch, types: ["question"] });
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdio servers stay alive until the host closes the transport.
}

main().catch((err) => {
  // MCP hosts read stdout for protocol frames — diagnostics go to stderr.
  console.error("[memory-mcp] fatal:", err);
  process.exit(1);
});
