# Project Memory

This repo is wired up to a Project Memory server. Before every task, call the `get_context` tool to load the current decisions, trade-offs, open questions, and constraints. Do not write code without checking memory first — agents who skip this step repeatedly violate constraints and re-open settled debates.

## How to use it

**At task start**

1. Call `get_context` with the current `branch` and the `files` you expect to touch.
2. Read the returned `constraints` first. Constraints are non-negotiable.
3. Read the `entries` (decisions, trade-offs, open questions). Treat them as settled — do not relitigate.
4. If `truncated: true` and your task seems context-heavy, call `get_context` again with `maxTokens: 10000`.

**Mid-task**

- If you encounter unfamiliar code, an unexpected pattern, or you're about to make a non-obvious choice, call `search_memory` with a natural-language description. Don't guess.
- If your task seems to touch an **open question**, stop and surface this to the developer before writing code.

**End of task**

- If you made a non-trivial decision, accepted a trade-off, or discovered an open question — call `log_entry`. The `rationale` field is the most important; future agents rely on it.
- Use `branch: <current-branch>` and `scope: feature` for branch-local entries. Tech lead promotes them at merge time.

## What counts as log-worthy

| Type | When to log |
|---|---|
| `decision` | You chose between real alternatives. Record what you chose, what you rejected, and why. |
| `tradeoff` | You deliberately accepted a downside (e.g. less generic, less performant, less complete). Prevents future agents "fixing" it. |
| `question` | You hit something you don't know and the answer matters. Log it before guessing. |
| `constraint` | A human reviewer said "must" / "cannot" / "non-negotiable". Constraints apply to every future task on every branch. |

## What NOT to log

- Code patterns visible in the codebase — `git blame` and the code itself are authoritative.
- Trivial fixes (typos, formatting, lint).
- Status updates ("started working on X").

## Configuration

The MCP server `phemesh-memory` is configured in this agent's settings. If `get_context` fails, the developer has not set `MEMORY_API_KEY` — flag it and proceed without memory rather than blocking the task.
