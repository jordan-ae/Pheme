# Project Memory (phemesh)

Agent context & decision intelligence — the MVP server from the Project Memory SRS.

The server ships `POST /log`, `GET /context`, `GET /search`, and the opt-in `/projects` registry, seeded with the 12 architecture decisions from the SRS. Alongside it: the [MCP wrapper](#mcp-wrapper), the [`memory` CLI](#cli-memory) (`init` / `onboard` / `status`), and the [scribe agent](#scribe-agent-ai-agent-provider-agnostic).

## Stack

- Node 20+ / TypeScript / Express
- Postgres + pgvector via Supabase
- Drizzle ORM
- Vercel AI SDK for embeddings (AD-11 — provider-swappable)
- pnpm workspaces

## Setup

### 1. Install pnpm and dependencies

```bash
# install pnpm if you don't have it
corepack enable
corepack prepare pnpm@9 --activate

pnpm install
```

### 2. Provision Supabase

1. Create a new project at <https://supabase.com>
2. Open **SQL Editor** and run the migrations in [`packages/memory-server/migrations/`](packages/memory-server/migrations/) in order: `0001_init` (schema), `0002_review_and_supersede` (scribe), `0004_projects` (CLI registry). `0003_waitlist` is only for the marketing site.
3. **Project settings → Database → Connection string → Transaction pooler** (port 6543) → copy URI

### 3. Configure env

```bash
cp .env.example .env
```

Fill in:

- `DATABASE_URL` — the Supabase transaction-pooler URI from step 2
- `MEMORY_API_KEY` — `openssl rand -hex 32`
- `OPENAI_API_KEY` — for embeddings (default provider per AD-11)

### 4. Seed the SRS decisions

```bash
pnpm seed
```

This inserts AD-01 through AD-12 as the first log entries. Idempotent — safe to re-run.

### 5. Run the server

```bash
pnpm dev
# -> http://localhost:4000
```

## Smoke test

```bash
KEY=$(grep MEMORY_API_KEY .env | cut -d= -f2)

# health (no auth)
curl http://localhost:4000/health

# context bundle (all global entries)
curl -H "Authorization: Bearer $KEY" "http://localhost:4000/context?branch=main"

# semantic search
curl -H "Authorization: Bearer $KEY" \
  "http://localhost:4000/search?q=why%20are%20we%20using%20supabase"

# log a new decision
curl -X POST http://localhost:4000/log \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "decision",
    "title": "Bundle estimate tokens at 4 chars per token",
    "body": "Token counts in /context responses use a chars/4 heuristic instead of a real tokenizer.",
    "rationale": "Real tokenizers are model-specific. Heuristic is good enough for budget enforcement; agents do exact counts themselves.",
    "tags": ["bundle", "tokens"],
    "author": "claude"
  }'
```

## API reference

### `GET /health`
Unauthenticated. Returns `{ status, time }`.

### `POST /log`
Authenticated. Creates a new entry. Body is validated by Zod (see [src/routes/log.ts](packages/memory-server/src/routes/log.ts)).
- `409` if `sha256(title+body)` collides — entries are deduped on content hash.
- `201` returns `{ id, entry }` (embedding stripped from response).

### `GET /context?branch=&files=&types=&maxTokens=`
Authenticated. Returns the right-sized context bundle for a branch.
- `branch` (default `global`)
- `files` (comma-separated paths — ranks entries by tag overlap)
- `types` (comma-separated subset of `decision,tradeoff,question,constraint`)
- `maxTokens` (default `MEMORY_BUNDLE_MAX_TOKENS`, hard ceiling `MEMORY_BUNDLE_HARD_CEILING`)

Response includes `constraints` (always returned in full per AD-12), `entries` (other types, capped), `truncated`, `omittedCount`, `tokensUsed`.

### `GET /search?q=&limit=&minSimilarity=`
Authenticated. pgvector cosine-similarity search over active entries.

## Repo layout

```
phemesh/
├── packages/
│   ├── memory-server/
│   │   ├── migrations/                    # 0001 schema · 0002 supersede · 0003 waitlist · 0004 projects
│   │   └── src/
│   │       ├── index.ts                   # server entry
│   │       ├── db/{client,schema}.ts      # Drizzle
│   │       ├── lib/{embedding,embed-queue,budget,hash}.ts  # embed-queue = async POST /log embedding
│   │       ├── middleware/auth.ts         # bearer-key auth (AD-07)
│   │       ├── routes/{log,context,search,supersede,projects}.ts
│   │       └── seed.ts                    # AD-01..AD-12
│   ├── memory-mcp/                        # stdio MCP wrapper (4 tools + instructions field)
│   └── memory-cli/                        # `memory` init / onboard / status
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## MCP wrapper

`packages/memory-mcp` is a stdio MCP server that wraps the REST API. Once registered with an agent, Claude Code / Cursor / Windsurf get four native tools:

| Tool | What it does |
|---|---|
| `get_context` | Returns the right-sized memory bundle. Call at task start. |
| `search_memory` | Semantic search. Call mid-task when uncertain. |
| `log_entry` | Record a decision / trade-off / question / constraint. |
| `list_open_questions` | List unresolved questions on a branch. |

**Build it once:**

```bash
pnpm --filter memory-mcp build
```

**Register it with Claude Code** — edit `~/.claude/settings.json` or your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "phemesh-memory": {
      "command": "node",
      "args": ["/Users/you/Desktop/phemesh/packages/memory-mcp/dist/index.js"],
      "env": {
        "MEMORY_SERVER_URL": "http://localhost:4000",
        "MEMORY_API_KEY": "<your key from .env>"
      }
    }
  }
}
```

For development without building, swap `command: "tsx"` and point at `src/index.ts`.

The MCP server also advertises an `instructions` string in its InitializeResponse (SRS §3.1) — MCP-native agents fold it into their system prompt automatically, so they know to call `get_context` / `list_open_questions` at task start without any committed instruction file.

## CLI (`memory`)

`packages/memory-cli` is the `memory` command (published as `npx memory`; locally, build then run `node packages/memory-cli/dist/index.js <cmd>`).

```bash
pnpm --filter memory-cli build

# Enroll this repo (reads the git remote, registers it server-side — SRS §4.1).
# Nothing is committed to the repo; needs the projects table (migration 0004).
memory init

# One-time machine setup: write the phemesh-memory MCP server into every agent's
# config (Claude Code, Cursor, OpenCode, OpenAI Codex, Google Antigravity).
# Merges into existing config, never clobbers. --all writes even undetected agents.
MEMORY_API_KEY=<key> memory onboard

# Is the current repo enrolled?
memory status
```

`init` canonicalises the remote URL (`git@…`, `https://…`, and `ssh://…` all map to the same `host/org/repo`) so every developer on the repo registers the identical identifier. Server URL / key come from `--server` / `--key` flags, then `MEMORY_SERVER_URL` / `MEMORY_API_KEY`, then a `.env` in the cwd.

> Enrollment is **registered** today; gating `/context` to return an empty bundle for *unenrolled* repos (SRS §4.2) is the remaining registry piece and is not yet wired into `/context`.

## Agent instruction templates

[templates/agent-instructions/](templates/agent-instructions/) contains drop-in files for any repo that uses Project Memory: `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `.github/copilot-instructions.md`. Copy them into your project root and the agents working in that repo will know to call the memory tools.

The phemesh repo itself ships with [CLAUDE.md](CLAUDE.md) — dogfooded so future Claude Code sessions working on phemesh use phemesh's own memory.

## Scribe agent (AI agent, provider-agnostic)

`packages/scribe-agent` is the always-on AI agent that auto-captures decisions from agent runs and other sources. It is **not a CLI** — it's an HTTP service running a tool-use loop.

**Architecture:**

```
┌─── source ──────────────────────┐    ┌── scribe-agent ───┐    ┌── memory-server ──┐
│  Claude Code Stop hook (curl)   │ ─→ │  Express service  │ ─→ │  REST API + DB    │
│  Cursor / Codex session end     │    │  generateText({   │    │  /search          │
│  GitHub PR comment webhook      │    │    tools,         │    │  /log             │
│  Slack message webhook          │    │    maxSteps: 10   │    │  /entries/:id/    │
│                                 │    │  })               │    │     supersede     │
└─────────────────────────────────┘    └───────────────────┘    └───────────────────┘
```

**Tools** the agent calls turn-by-turn:

- `search_memory` — check existing entries before logging
- `log_entry` — write new active entries
- `supersede_entry` — replace an existing entry when a decision is updated
- `flag_for_review` — record low-confidence items as `pending_review` (excluded from `/context` until a human confirms)

**Model**: provider-agnostic via Vercel AI SDK (`SCRIBE_MODEL_PROVIDER` = `anthropic` | `openai` | `google`). Default: `anthropic/claude-sonnet-4-6`.

### Run it

```bash
# requires migration 0002 applied in Supabase first
pnpm install
pnpm --filter memory-server dev          # terminal 1 — http://localhost:4000
pnpm --filter scribe-agent dev           # terminal 2 — http://localhost:5000
```

### Hook it up

See [templates/agent-hooks/README.md](templates/agent-hooks/README.md) for the Claude Code Stop hook (a single `curl` line). Cursor / Codex / GitHub / Slack adapters all land as additional source endpoints on the same service.

## What's next

- Cursor + Codex session-end source adapters (more `/events/*` endpoints)
- GitHub Actions PR hook — auto-posts a context-aware review prompt
- Slack source adapter for `/memory` commands + channel monitoring
- Human review UI for `pending_review` entries — Phase 4
