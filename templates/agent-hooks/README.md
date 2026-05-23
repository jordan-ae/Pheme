# Agent hooks — auto-capture from agent runs

These hooks fire when an agent finishes a turn or session. They POST the event payload to **scribe-agent**, which:

1. Reads the just-finished transcript
2. Looks up the cursor for `(source, session)` and slices only new content
3. Runs the **agent loop** (model + 4 tools, `maxSteps: 10`)
4. The agent reasons turn-by-turn: searches existing memory, decides what to log / supersede / flag for review
5. Advances the cursor only on success (failures retry the same slice on the next event)

## Supported now

| Agent | Hook | Endpoint | Status |
|---|---|---|---|
| Claude Code | `Stop` | `POST /events/claude-code-stop` | ✅ |
| Cursor | TBD | `POST /events/cursor-session-end` | held |
| Codex | TBD | `POST /events/codex-turn-end` | held |
| GitHub | webhook | `POST /events/github-pr-comment` | held |

## Claude Code installation

1. Make sure scribe-agent is running:

   ```bash
   pnpm --filter scribe-agent dev
   # -> http://localhost:5000
   ```

2. Export `MEMORY_API_KEY` so the hook command inherits it:

   ```bash
   echo 'export MEMORY_API_KEY="<paste from .env>"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. Merge the `hooks` block from [`claude-code-settings.json`](claude-code-settings.json) into `~/.claude/settings.json`.

4. Restart Claude Code. Trigger any turn. Then verify:

   ```bash
   # check that the agent saw the event
   curl -H "Authorization: Bearer $MEMORY_API_KEY" \
     "http://localhost:4000/search?q=anything%20recent%20from%20a%20session"

   # entries written by the agent are tagged source:claude-code-stop and session:<uuid>
   ```

## Operational notes

- **Cost**: each Stop fires one agent run. The cursor means each run sees only new content. Tune `SCRIBE_MAX_STEPS`, `SCRIBE_TEMPERATURE`, or switch `SCRIBE_MODEL_PROVIDER` if you need a different cost/quality point.
- **Failure mode**: if memory-server is down or the model errors out, the cursor doesn't advance. Claude Code itself keeps running — the hook silently 502s. Next Stop retries the same slice.
- **Branch tagging**: the agent runs `git rev-parse --abbrev-ref HEAD` from the hook's `cwd` to tag entries with the current branch.
- **Switching models mid-session**: change `SCRIBE_MODEL_PROVIDER` / `SCRIBE_MODEL`, restart scribe-agent, no other config moves.
- **Disable temporarily**: comment out the `Stop` block in settings.json, or stop scribe-agent (the hook 502s, Claude Code keeps working).
