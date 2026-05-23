# Project Memory (phemesh) — agent instructions

This is the Project Memory repo itself. It runs its own memory server and dogfoods the system: when an agent works on phemesh, it must check phemesh's own memory first.

## Workflow

**Task start** — call `get_context` (MCP tool from `phemesh-memory`) with the current branch and the files you plan to touch. The 12 architecture decisions (AD-01 through AD-12) are seeded as global entries — read them before proposing any architectural change.

**Mid-task** — call `search_memory` when you encounter unfamiliar choices in the code. Examples worth searching: "why pgvector", "why supabase", "embedding dimension", "bundle size".

**Open questions** — there are open questions in the SRS (Q-03 through Q-07) that have not yet been seeded. If your task touches Slack monitoring, Notion integration, PR review surface, or project off-boarding, surface this to the developer before writing code.

**Task end** — log non-trivial decisions you make. Use `scope: feature` and `branch: <current-branch>` for branch-local work. The tech lead promotes them to `global` at merge time.

## Project context

- `packages/memory-server` — REST server, seeded with AD-01..AD-12
- `packages/memory-mcp` — MCP wrapper exposing 4 tools to agents
- `packages/memory-cli` — `memory` CLI: `init` (opt-in repo enrollment), `onboard` (writes MCP config for all five agents), `status`
- `templates/agent-instructions/` — copy-paste templates for other repos
- The original SRS lives at `~/Downloads/ProjectMemory_SRS.docx`

## Important behaviours

- **Do not relitigate AD-01..AD-12** without a formal open question and tech-lead sign-off (see AD-09 promotion gating).
- **Embeddings are pinned to 1536 dimensions** (AD-11). Switching to a non-1536 model requires a migration script, not just a config change.
- **Bundle size cap defaults to 3000 tokens, hard ceiling 10000** (AD-12). Constraints are always uncapped.
- **Auth is a single shared bearer key** (AD-07). Per-agent keys are explicitly v2.
