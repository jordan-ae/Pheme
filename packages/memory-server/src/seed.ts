import "./lib/load-env.js";
import { eq } from "drizzle-orm";
import { db } from "./db/client.js";
import { memoryEntries, projects, type NewMemoryEntry } from "./db/schema.js";
import { embedText } from "./lib/embedding.js";
import { contentHash } from "./lib/hash.js";

type SeedEntry = Omit<NewMemoryEntry, "embedding" | "contentHash" | "projectId"> & {
  externalId: string;
};

const SEED_AUTHOR = "design-team";
const SEED_BRANCH = "global";
// The AD-01..AD-13 decisions describe phemesh's own architecture, so they belong
// to the phemesh project (AD-13) — not a cross-project tier. Override the
// identifier for a different deployment with MEMORY_SEED_PROJECT.
const SEED_PROJECT_IDENTIFIER = process.env.MEMORY_SEED_PROJECT ?? "github.com/bleash-dev/phemesh";
const SEED_PROJECT_NAME = "phemesh";

// Ensure the phemesh project exists and return its id (idempotent).
async function ensureSeedProject(): Promise<string> {
  const existing = await db.query.projects.findFirst({
    where: eq(projects.identifier, SEED_PROJECT_IDENTIFIER),
  });
  if (existing) return existing.id;
  const [created] = await db
    .insert(projects)
    .values({ identifier: SEED_PROJECT_IDENTIFIER, name: SEED_PROJECT_NAME, enrolledBy: SEED_AUTHOR })
    .returning();
  if (!created) throw new Error("failed to create seed project");
  return created.id;
}

const ENTRIES: SeedEntry[] = [
  {
    externalId: "AD-01",
    type: "decision",
    title: "Use a centralised memory server, not a git-tracked file",
    body:
      "Project Memory is served by a live HTTP/MCP server rather than a context.md file committed to git. " +
      "All agents query the same server and receive the same truth in real time.",
    rationale:
      "Branch divergence and file bloat make a git-tracked file unworkable at team scale. " +
      "Trade-off: requires running infrastructure, accepted because real-time sync outweighs the operational cost.",
    tags: ["architecture", "core"],
    scope: "global",
  },
  {
    externalId: "AD-02",
    type: "decision",
    title: "Use Postgres + pgvector as the single data store",
    body:
      "One Postgres database with the pgvector extension handles both structured queries (by branch, type, tag) " +
      "and semantic search (by meaning). No separate vector DB.",
    rationale:
      "Operationally simpler than maintaining Postgres + a dedicated vector DB. " +
      "pgvector's recall is slightly lower at very large scale — accepted because team-scale memory will not have millions of entries.",
    tags: ["architecture", "database", "search"],
    scope: "global",
  },
  {
    externalId: "AD-03",
    type: "decision",
    title: "Use MCP as the primary agent interface",
    body:
      "Memory server exposes its tools via Model Context Protocol. Claude Code, Cursor, and Windsurf get native integration with no wrapper script. " +
      "REST API remains available as a fallback for non-MCP agents.",
    rationale:
      "MCP is the native tool protocol for the team's most-used agents. Native integration eliminates per-agent glue code. " +
      "Trade-off: MCP adds build complexity — accepted for the integration win.",
    tags: ["architecture", "agents", "mcp"],
    scope: "global",
  },
  {
    externalId: "AD-04",
    type: "decision",
    title: "Branch-aware scoping lives in the database, not the file system",
    body:
      "Scope is a property of each log entry (global / feature / spike / archived). " +
      "The server resolves the correct scope chain per query. There is no per-branch context file.",
    rationale:
      "Avoids merge conflicts and divergent context across long-lived branches. " +
      "Server does more work per request — correct separation of concerns.",
    tags: ["architecture", "scoping"],
    scope: "global",
  },
  {
    externalId: "AD-05",
    type: "decision",
    title: "Run the scribe as a separate dedicated agent",
    body:
      "Log extraction is performed by a dedicated always-on scribe agent, not by individual task agents. " +
      "Task agents stay focused on their task; the scribe stays focused on signal extraction.",
    rationale:
      "More accurate and consistent than asking every coding agent to also self-log. " +
      "Trade-off: one more always-on process — small and cheap to run.",
    tags: ["architecture", "scribe", "agents"],
    scope: "global",
  },
  {
    externalId: "AD-06",
    type: "decision",
    title: "Assemble the context bundle server-side, not client-side",
    body:
      "The memory server knows the full scope chain, active status, and tag taxonomy. It assembles the bundle and returns a right-sized JSON+markdown payload.",
    rationale:
      "Keeps agents thin — they call one endpoint instead of downloading the whole log and filtering locally. " +
      "Server does more work per request — accepted as correct architecture.",
    tags: ["architecture", "api", "bundle"],
    scope: "global",
  },
  {
    externalId: "AD-07",
    type: "decision",
    title: "v1 uses a single shared team API key",
    body:
      "All developers and all agents authenticate with one shared MEMORY_API_KEY in v1. Rotation is a one-command operation. Per-agent keys arrive in v2 for full audit trail.",
    rationale:
      "Minimises onboarding friction. Trade-off: less granular audit trail in v1 — accepted because adoption matters more than traceability for the first release.",
    tags: ["security", "auth", "v1"],
    scope: "global",
  },
  {
    externalId: "AD-08",
    type: "decision",
    title: "Recommend Supabase as the managed deployment",
    body:
      "Supabase free tier gives Postgres + pgvector + REST out of the box. Teams can be running in under an hour with no DevOps. The system remains portable to any Postgres instance.",
    rationale:
      "Lowest-friction path to production. Trade-off: vendor dependency on Supabase — accepted, system is not locked in.",
    tags: ["deployment", "supabase", "infrastructure"],
    scope: "global",
  },
  {
    externalId: "AD-09",
    type: "decision",
    title: "Branch-merge promotion is human-gated",
    body:
      "When a feature branch merges to main, feature-scoped entries are queued for tech-lead review. The reviewer marks each entry as global, archive, or discard before global promotion occurs.",
    rationale:
      "Prevents agent-generated decisions from silently polluting global memory. Trade-off: promotion adds a step to the merge workflow — intentional governance checkpoint.",
    tags: ["governance", "merge", "promotion"],
    scope: "global",
  },
  {
    externalId: "AD-10",
    type: "decision",
    title: "Entries are never hard-deleted, only archived",
    body:
      "Discarded entries are soft-deleted and remain queryable for history. Active context excludes them. The full decision history is always recoverable.",
    rationale:
      "Future agents can understand why a decision was reversed. Trade-off: DB grows over time — log entries are small text records, storage is not a concern at team scale.",
    tags: ["governance", "history"],
    scope: "global",
  },
  {
    externalId: "AD-11",
    type: "decision",
    title: "Abstract embeddings via the Vercel AI SDK",
    body:
      "All embedding calls go through the Vercel AI SDK's embed/embedMany. Provider and model are selected via env (MEMORY_EMBEDDING_PROVIDER, MEMORY_EMBEDDING_MODEL).",
    rationale:
      "Q-01 (which embedding model) is unresolved on cost / latency / data residency. The SDK lets us swap providers without code changes. " +
      "Trade-off: the vector column is pinned to 1536 dimensions — only models that natively produce 1536-dim vectors or support Matryoshka truncation are allowed. Switching past that requires a backfill.",
    tags: ["embeddings", "vendor-abstraction", "config"],
    scope: "global",
  },
  {
    externalId: "AD-12",
    type: "decision",
    title: "Context bundle size is configurable, with constraints always pinned",
    body:
      "MEMORY_BUNDLE_MAX_TOKENS sets the default (3000). Callers can override per-request up to MEMORY_BUNDLE_HARD_CEILING (10000). " +
      "Constraints are always returned in full and do not count against the cap; only decisions, trade-offs, and open questions are truncated when the cap is hit.",
    rationale:
      "Q-02 (max bundle size) trades completeness vs. agent context window. Different agents have different windows; fixed caps are wrong for one end or the other. " +
      "Trade-off: bundles can grow to 5% of an Opus context — hard ceiling prevents runaway growth and forces good scoping.",
    tags: ["api", "bundle", "config"],
    scope: "global",
  },
];

async function main() {
  const projectId = await ensureSeedProject();
  console.log(`[seed] project ${SEED_PROJECT_IDENTIFIER} (${projectId})`);
  console.log(`[seed] inserting ${ENTRIES.length} entries...`);
  let inserted = 0;
  let skipped = 0;

  for (const e of ENTRIES) {
    const hash = contentHash(e.title, e.body);
    const existing = await db.query.memoryEntries.findFirst({
      where: eq(memoryEntries.contentHash, hash),
    });
    if (existing) {
      console.log(`  [skip] ${e.externalId} already present (${existing.id})`);
      skipped += 1;
      continue;
    }
    const embedding = await embedText([e.title, e.body, e.rationale ?? ""].join("\n"));
    const tags = [...(e.tags ?? []), e.externalId.toLowerCase()];
    await db.insert(memoryEntries).values({
      ...e,
      tags,
      author: SEED_AUTHOR,
      branch: SEED_BRANCH,
      projectId,
      contentHash: hash,
      embedding,
    });
    console.log(`  [ok]   ${e.externalId}: ${e.title}`);
    inserted += 1;
  }

  console.log(`[seed] done. inserted=${inserted} skipped=${skipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
