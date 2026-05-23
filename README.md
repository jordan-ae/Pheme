<div align="center">

# Pheme — Project Memory

**The shared memory layer for AI coding agents.**

Decisions, constraints, and trade-offs travel with the *project* — not the conversation. Every agent that touches the repo reads the same truth in real time and writes back what it learns.

[![License: Proprietary](https://img.shields.io/badge/license-proprietary-7c3a3a.svg)](#license)
[![Node](https://img.shields.io/badge/node-%E2%89%A520-3c873a.svg)](#requirements)
[![pnpm](https://img.shields.io/badge/pnpm-%E2%89%A59-f69220.svg)](#requirements)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)](#requirements)
[![Protocol](https://img.shields.io/badge/MCP-native-6b5bd2.svg)](#mcp-wrapper)

</div>

---

## The problem

Every coding agent ships with the same trick: a long context window and a clever way to forget it. Sessions get compacted, branches get archived, new agents get spun up — and the load-bearing decisions ("we use pgvector *because*…", "embeddings are pinned to 1536 dims, do **not** change that without a migration") evaporate. The next agent re-litigates a settled question, or worse, silently violates it.

**Pheme** keeps those decisions where they belong: attached to the project, in a live store every agent queries before it writes code and updates as it works.

```
Claude Code ─┐
Cursor ──────┤
Windsurf ────┼──►  Pheme  ──►  Postgres + pgvector
Codex ───────┤   (MCP + REST)   (one shared truth)
your loop ───┘
```

---

## Contents

- [What's in the box](#whats-in-the-box)
- [Requirements](#requirements)
- [Quickstart](#quickstart)
- [Smoke test](#smoke-test)
- [MCP wrapper](#mcp-wrapper)
- [CLI (`memory`)](#cli-memory)
- [Authentication](#authentication)
- [REST API reference](#rest-api-reference)
- [Scribe agent](#scribe-agent)
- [Agent instruction templates](#agent-instruction-templates)
- [Architecture decisions (AD-01…AD-13)](#architecture-decisions)
- [Open questions](#open-questions)
- [Configuration](#configuration)
- [Repo layout](#repo-layout)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## What's in the box

This is a pnpm-workspace monorepo. Five packages, one shared memory store.

| Package | What it is |
|---|---|
| [`packages/memory-server`](packages/memory-server/) | The core. An Express REST API over Postgres + pgvector. Assembles right-sized context bundles, runs semantic search, mints keys, isolates projects. Seeded with the 12 founding architecture decisions. |
| [`packages/memory-mcp`](packages/memory-mcp/) | A stdio **MCP** server that wraps the REST API and gives Claude Code / Cursor / Windsurf four native tools — plus an `instructions` field that teaches agents *when* to call them. |
| [`packages/memory-cli`](packages/memory-cli/) | The `memory` command: `init` (enroll a repo), `onboard` (wire the MCP server into every agent on a machine), `status`, `key:create`. |
| [`packages/scribe-agent`](packages/scribe-agent/) | An always-on, provider-agnostic AI agent that auto-captures decisions from agent runs (and, soon, PR comments / Slack) so humans don't have to log by hand. |
| [`packages/marketing`](packages/marketing/) | The [pheme](https://phemesh.dev) Next.js marketing site (runs on port 3001). |

### Stack

- **Node 20+ / TypeScript / Express**
- **Postgres + pgvector** via [Supabase](https://supabase.com) — one store for structured *and* semantic queries (no separate vector DB; [AD-02](#architecture-decisions))
- **Drizzle ORM**
- **Vercel AI SDK** for embeddings — provider-swappable, pinned to 1536 dims ([AD-11](#architecture-decisions))
- **Model Context Protocol** for the agent interface ([AD-03](#architecture-decisions))
- **pnpm workspaces**

---

## Requirements

- Node **≥ 20**
- pnpm **≥ 9** (`corepack enable && corepack prepare pnpm@9 --activate`)
- A Postgres database with the `pgvector` extension — a free [Supabase](https://supabase.com) project is the recommended path ([AD-08](#architecture-decisions))
- An embeddings provider key (OpenAI by default)

---

## Quickstart

### 1. Install

```bash
corepack enable
corepack prepare pnpm@9 --activate
pnpm install
```

### 2. Provision the database

1. Create a project at <https://supabase.com>.
2. Open **SQL Editor** and run the migrations in [`packages/memory-server/migrations/`](packages/memory-server/migrations/) **in order**:

   | Migration | Adds |
   |---|---|
   | `0001_init.sql` | core schema + pgvector |
   | `0002_review_and_supersede.sql` | scribe review + supersession |
   | `0003_waitlist.sql` | *(marketing site only — optional)* |
   | `0004_projects.sql` | the opt-in project registry |
   | `0005_entry_project.sql` | per-entry project isolation |
   | `0006_api_keys.sql` | per-user API keys |

3. **Project settings → Database → Connection string → Transaction pooler** (port `6543`) → copy the URI.

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in at minimum:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the Supabase **transaction-pooler** URI from step 2 |
| `MEMORY_API_KEY` | `openssl rand -hex 32` — the shared/admin key |
| `OPENAI_API_KEY` | for embeddings (default provider, [AD-11](#architecture-decisions)) |

See [Configuration](#configuration) for the full list.

### 4. Seed the founding decisions

```bash
pnpm seed
```

Inserts [AD-01 through AD-12](#architecture-decisions) as the first entries. **Idempotent** — content is deduped on a SHA-256 hash, so it's safe to re-run.

### 5. Run the server

```bash
pnpm dev
# → http://localhost:4000
```

---

## Smoke test

```bash
KEY=$(grep '^MEMORY_API_KEY' .env | cut -d= -f2)
PROJ="github.com/your-org/your-repo"   # an enrolled project identifier

# health (no auth, no project)
curl http://localhost:4000/health

# context bundle for a branch
curl -H "Authorization: Bearer $KEY" -H "X-Project: $PROJ" \
  "http://localhost:4000/context?branch=main"

# semantic search
curl -H "Authorization: Bearer $KEY" -H "X-Project: $PROJ" \
  "http://localhost:4000/search?q=why%20supabase"

# log a new decision
curl -X POST http://localhost:4000/log \
  -H "Authorization: Bearer $KEY" -H "X-Project: $PROJ" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "decision",
    "title": "Estimate bundle tokens at 4 chars per token",
    "body": "/context token counts use a chars/4 heuristic, not a real tokenizer.",
    "rationale": "Tokenizers are model-specific; the heuristic is good enough for budget enforcement and agents do exact counts themselves.",
    "tags": ["bundle", "tokens"]
  }'
```

> **`X-Project` is required** on all data routes. The MCP wrapper sends it automatically from the repo's git remote; for raw `curl` you pass it yourself, and the repo must be enrolled first (`memory init`). See [Authentication](#authentication).

---

## MCP wrapper

[`packages/memory-mcp`](packages/memory-mcp/) is a stdio MCP server that wraps the REST API. Once registered, any MCP-native agent gets four tools:

| Tool | When to call it |
|---|---|
| `get_context` | **At task start.** Returns the right-sized memory bundle for the branch + files you're about to touch. Constraints always come back in full. |
| `list_open_questions` | **At task start.** Surfaces unresolved blockers that touch your work. |
| `search_memory` | **Mid-task.** Semantic search when you hit an unfamiliar choice in the code. |
| `log_entry` | **At task end.** Record a decision, trade-off, open question, or constraint. `rationale` is the most important field. |

**Build it once:**

```bash
pnpm --filter memory-mcp build
```

**Register it with Claude Code** — `~/.claude/settings.json` or your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "phemesh-memory": {
      "command": "node",
      "args": ["/absolute/path/to/phemesh/packages/memory-mcp/dist/index.js"],
      "env": {
        "MEMORY_SERVER_URL": "http://localhost:4000",
        "MEMORY_API_KEY": "<your key>"
      }
    }
  }
}
```

> For development without a build step, set `"command": "tsx"` and point `args` at `src/index.ts`.

The MCP server also advertises an [`instructions`](packages/memory-mcp/src/index.ts) string in its `InitializeResponse` (SRS §3.1). MCP-native agents fold it into their system prompt automatically — so they know to call `get_context` / `list_open_questions` at task start **without any committed instruction file**.

Don't want to wire it by hand? Run [`memory onboard`](#cli-memory).

---

## CLI (`memory`)

[`packages/memory-cli`](packages/memory-cli/) is the `memory` command. Build it, then run:

```bash
pnpm --filter memory-cli build
node packages/memory-cli/dist/index.js <command>
```

| Command | Does |
|---|---|
| `memory init` | **Enroll the current repo.** Reads the git `origin` remote, canonicalises it (`git@…`, `https://…`, `ssh://…` all map to one `host/org/repo`), and registers it server-side. Nothing is committed; needs migration `0004`. |
| `memory status` | Is the current repo enrolled? |
| `memory onboard` | One-time machine setup: writes the `phemesh-memory` MCP server into **every** detected agent's config (Claude Code, Cursor, OpenCode, OpenAI Codex, Google Antigravity). Merges into existing config, never clobbers. `--all` writes even undetected agents. |
| `memory key:create --user <email>` | Mint a per-user API key (admin only — uses the shared key). The raw key is printed **once**. |

Config resolution for every command: `--server`/`--key` flags → `MEMORY_SERVER_URL`/`MEMORY_API_KEY` env → a `.env` in the cwd. Run `memory help` for the full flag list.

> **Enrollment gate:** repos must be enrolled before memory accrues. The server rejects an unknown `X-Project` with `403 project_not_enrolled` rather than auto-creating it ([AD-13](#architecture-decisions)) — so memory only builds up for repos a human deliberately ran `memory init` on.

---

## Authentication

Two layers, both via the `Authorization: Bearer <key>` header.

**Shared admin key ([AD-07](#architecture-decisions)).** `MEMORY_API_KEY` is the bootstrap key. It authenticates all calls and is the only key allowed to mint per-user keys. Callers using the shared key directly are attributed `anonymous`.

**Per-user keys ([AD-07 v2](#architecture-decisions)).** For a real per-developer audit trail:

```bash
# admin mints a key for a teammate (prints the raw key ONCE)
memory key:create --user dev@your-org.com --label laptop
# → pmk_… 
```

Keys are stored **hashed** (`pmk_` prefix, only the hash persists). Each developer sets their minted key as `MEMORY_API_KEY` in their agent's MCP config in place of the shared one; everything they log is then attributed to them.

**Project isolation ([AD-13](#architecture-decisions)).** Every data route also requires an `X-Project` header (the canonical git-remote identifier). The MCP wrapper derives it from the repo's `origin` remote; for a repo with no remote yet, set `MEMORY_PROJECT` in that repo's own `.env`. Reads and writes are hard-isolated to the resolved project.

---

## REST API reference

All routes except `/health` require `Authorization: Bearer <key>`. All data routes additionally require `X-Project`.

### `GET /health`
Unauthenticated. Returns `{ status, time }`.

### `POST /log`
Create an entry. Body validated by Zod ([routes/log.ts](packages/memory-server/src/routes/log.ts)).
- `201` → `{ id, entry }` (embedding stripped from the response; embedded asynchronously).
- `409` if `sha256(title+body)` collides — entries are deduped on content hash.

### `GET /context?branch=&files=&types=&maxTokens=`
Returns the right-sized context bundle for a branch ([AD-06](#architecture-decisions)).
- `branch` (default `global`) — resolves the `global + branch` scope chain
- `files` (comma-separated) — ranks entries by tag overlap
- `types` — subset of `decision,tradeoff,question,constraint`
- `maxTokens` — default `MEMORY_BUNDLE_MAX_TOKENS` (3000), hard ceiling `MEMORY_BUNDLE_HARD_CEILING` (10000)

Response: `constraints` (**always** returned in full, never counted against the cap — [AD-12](#architecture-decisions)), `entries` (other types, truncated by relevance), plus `truncated`, `omittedCount`, `tokensUsed`.

### `GET /search?q=&limit=&minSimilarity=`
pgvector cosine-similarity search over **active** entries. `limit` default 5 (max 20); `minSimilarity` default 0.2.

### `POST /entries/:id/supersede`
Replace an entry when a decision is updated. The old entry is kept (never hard-deleted — [AD-10](#architecture-decisions)) and the supersede chain is preserved.

### `POST /keys`
Admin only (shared key). Mints a per-user key. Returns the raw key exactly once. See [Authentication](#authentication).

### `POST /projects`
The opt-in enrollment registry. Backs `memory init`. Needs migration `0004`.

---

## Scribe agent

[`packages/scribe-agent`](packages/scribe-agent/) is the always-on AI agent that auto-captures decisions — so the memory fills itself ([AD-05](#architecture-decisions): a dedicated scribe is more accurate than asking every coding agent to self-log). It is **not a CLI** — it's an HTTP service running a tool-use loop.

```
┌─── source ──────────────────────┐    ┌── scribe-agent ───┐    ┌── memory-server ──┐
│  Claude Code Stop hook (curl)   │ ─→ │  Express service  │ ─→ │  REST API + DB    │
│  Cursor / Codex session end     │    │  generateText({   │    │  /search          │
│  GitHub PR comment webhook      │    │    tools,         │    │  /log             │
│  Slack message webhook          │    │    maxSteps: 10 } │    │  /entries/:id/    │
└─────────────────────────────────┘    └───────────────────┘    │     supersede     │
                                                                 └───────────────────┘
```

**Tools the agent calls turn-by-turn:**

- `search_memory` — check for existing entries before logging
- `log_entry` — write new active entries
- `supersede_entry` — replace an entry when a decision changes
- `flag_for_review` — record low-confidence items as `pending_review` (excluded from `/context` until a human confirms)

**Model:** provider-agnostic via the Vercel AI SDK. `SCRIBE_MODEL_PROVIDER` ∈ `anthropic` | `openai` | `google`; default `anthropic/claude-sonnet-4-6`.

**Run it:**

```bash
# requires migration 0002
pnpm --filter memory-server dev    # terminal 1 → :4000
pnpm --filter scribe-agent dev     # terminal 2 → :5000
```

**Hook it up:** see [templates/agent-hooks/README.md](templates/agent-hooks/) for the Claude Code Stop hook — a single `curl` line.

---

## Agent instruction templates

[templates/agent-instructions/](templates/agent-instructions/) holds drop-in files for any repo that uses Pheme: `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `.github/copilot-instructions.md`. Copy them into a project root and agents working there will know to call the memory tools. (MCP-native agents get this for free via the [`instructions` field](#mcp-wrapper) — the templates cover the rest.)

This repo dogfoods the system: its own [CLAUDE.md](CLAUDE.md) points future Claude Code sessions at Pheme's own memory before they touch the code.

---

## Architecture decisions

The 12 founding decisions ([`seed.ts`](packages/memory-server/src/seed.ts)) are seeded as global memory entries. **Read them before proposing any architectural change** — and don't relitigate them without a formal [open question](#open-questions) and tech-lead sign-off ([AD-09](#architecture-decisions) promotion gating).

| # | Decision |
|---|---|
| **AD-01** | Centralised live memory server, **not** a git-tracked context file. |
| **AD-02** | Postgres + **pgvector** as the single store — structured *and* semantic queries, no separate vector DB. |
| **AD-03** | **MCP** is the primary agent interface; REST is the fallback. |
| **AD-04** | Branch-aware scoping lives in the **database** (scope per entry), not the file system. |
| **AD-05** | The **scribe** is a separate dedicated agent, not a job bolted onto task agents. |
| **AD-06** | Context bundles are assembled **server-side** and returned right-sized. |
| **AD-07** | v1 auth is a **single shared key**; per-user keys are v2 *(now implemented)*. |
| **AD-08** | **Supabase** is the recommended managed deployment; the system stays portable to any Postgres. |
| **AD-09** | Branch-merge promotion is **human-gated** *(under review — see [Q-08](#open-questions))*. |
| **AD-10** | Entries are **never hard-deleted**, only archived — history is always recoverable. |
| **AD-11** | Embeddings abstracted via the **Vercel AI SDK**; the vector column is **pinned to 1536 dims**. |
| **AD-12** | Bundle size is **configurable** (default 3000, ceiling 10000); **constraints are always pinned** in full. |
| **AD-13** | Per-project **isolation** via the `X-Project` header; enrollment is opt-in. *(Enforced in code, not seeded.)* |

> ⚠️ **Load-bearing constraints**
> - **Embeddings are pinned to 1536 dimensions ([AD-11]).** Switching to a non-1536 model requires a backfill migration, not just a config change.
> - **Bundle cap defaults to 3000 tokens, hard ceiling 10000 ([AD-12]).** Constraints are always uncapped.
> - **Auth admin key is a single shared bearer key ([AD-07]).** Per-user keys layer on top; they don't replace the admin bootstrap.

---

## Open questions

- **Q-03…Q-07** live in the SRS and are **not yet seeded.** If your task touches **Slack monitoring**, **Notion integration**, **the PR review surface**, or **project off-boarding**, surface it to the developer before writing code.
- **[Q-08 — promote-by-default vs. AD-09](docs/open-questions/Q-08-merge-promotion-model.md):** a proposal to replace AD-09's blocking, human-gated merge promotion with auto-promotion that leans on the scribe's `pending_review` signal. Awaiting tech-lead sign-off; on approval it gets logged as a decision that **supersedes AD-09**.

---

## Configuration

From [`.env.example`](.env.example):

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | — | Supabase **transaction-pooler** URI (port 6543). |
| `MEMORY_API_KEY` | — | Shared/admin bearer key. `openssl rand -hex 32`. |
| `PORT` | `4000` | memory-server port. |
| `MEMORY_EMBEDDING_PROVIDER` | `openai` | Embeddings provider (AD-11). |
| `MEMORY_EMBEDDING_MODEL` | `text-embedding-3-small` | Must produce or truncate to 1536 dims. |
| `MEMORY_EMBEDDING_DIMENSIONS` | `1536` | **Pinned** (AD-11). |
| `OPENAI_API_KEY` | — | Used by embeddings (and the scribe if `SCRIBE_MODEL_PROVIDER=openai`). |
| `MEMORY_BUNDLE_MAX_TOKENS` | `3000` | Default bundle cap (AD-12). |
| `MEMORY_BUNDLE_HARD_CEILING` | `10000` | Per-request override ceiling (AD-12). |
| `MEMORY_SERVER_URL` | `http://localhost:4000` | Read by the MCP wrapper / CLI. |
| `MEMORY_PROJECT` | *(derived)* | Only set for a repo with no git remote yet. |
| `SCRIBE_AGENT_PORT` | `5000` | scribe-agent port. |
| `SCRIBE_MODEL_PROVIDER` | `anthropic` | `anthropic` \| `openai` \| `google`. |
| `SCRIBE_MODEL` | `claude-sonnet-4-6` | |
| `SCRIBE_TEMPERATURE` | `0.2` | |
| `SCRIBE_MAX_STEPS` | `10` | Tool-use loop cap. |
| `ANTHROPIC_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` | — | Set whichever scribe provider you select. |

---

## Repo layout

```
phemesh/
├── packages/
│   ├── memory-server/
│   │   ├── migrations/                  # 0001 init · 0002 supersede · 0003 waitlist
│   │   │                                #   0004 projects · 0005 entry_project · 0006 api_keys
│   │   └── src/
│   │       ├── index.ts                 # server entry
│   │       ├── db/{client,schema}.ts    # Drizzle
│   │       ├── lib/{embedding,embed-queue,budget,hash,load-env}.ts
│   │       ├── middleware/{auth,project}.ts   # bearer auth (AD-07) · project isolation (AD-13)
│   │       ├── routes/{log,context,search,supersede,projects,keys}.ts
│   │       └── seed.ts                   # AD-01..AD-12
│   ├── memory-mcp/                       # stdio MCP wrapper (4 tools + instructions)
│   ├── memory-cli/                       # `memory` init / status / onboard / key:create
│   ├── scribe-agent/                     # always-on capture agent (tool-use loop)
│   └── marketing/                        # Next.js site (port 3001)
├── templates/
│   ├── agent-instructions/               # CLAUDE.md · .cursorrules · .windsurfrules · copilot
│   └── agent-hooks/                      # Claude Code Stop hook
├── docs/open-questions/                  # Q-08 …
├── CLAUDE.md                             # dogfooded agent instructions for this repo
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

### Root scripts

| Command | Runs |
|---|---|
| `pnpm dev` | memory-server in watch mode |
| `pnpm build` | build every package (`pnpm -r build`) |
| `pnpm seed` | seed AD-01..AD-12 |
| `pnpm typecheck` | typecheck every package |

---

## Roadmap

- Cursor + Codex session-end source adapters (more `/events/*` endpoints on the scribe)
- GitHub Actions PR hook — auto-posts a context-aware review prompt
- Slack source adapter for `/pheme` commands + channel monitoring
- Human review UI for `pending_review` entries (Phase 4)
- Resolve [Q-08](#open-questions) and, on approval, build merge-time auto-promotion

---

## Contributing

This repo **dogfoods Pheme on itself.** When you (or your agent) work here:

1. **Start** by calling `get_context` with your branch + the files you'll touch, and `list_open_questions` to check for blockers.
2. **Mid-task**, `search_memory` whenever you hit an unfamiliar choice.
3. **End** by logging non-trivial decisions with `log_entry` — use `scope: feature` and your branch for branch-local work; the tech lead promotes it to `global` at merge time.

Treat every returned **constraint** as non-negotiable, and don't relitigate AD-01…AD-13 without a formal open question and sign-off. The full workflow is in [CLAUDE.md](CLAUDE.md).

---

## License

**Proprietary.** © 2026 Pheme Labs. All rights reserved. This repository is private and shared with collaborators for internal development only — not licensed for redistribution or public use.

<div align="center">
<sub>Built in Athens, GA · named for <b>Φήμη</b>, the Greek messenger goddess of report and rumor.</sub>
</div>
