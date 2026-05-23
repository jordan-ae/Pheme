# Project Memory — Copilot instructions

This repository uses Project Memory. Copilot does not currently support MCP, so use the REST API directly via the developer's terminal or the `memory-cli` if available.

## Behaviour

- When suggesting non-trivial code, mention any relevant decisions or constraints that the developer should verify against memory. Phrase as: "Check memory for decisions about <topic>" rather than inventing rationale.
- Do not generate code that obviously conflicts with widespread industry constraints (security, accessibility, etc.) without flagging.
- When the developer logs a decision in chat, suggest they record it via `npx memory log` so future agents inherit it.

## Reference

The memory server is documented in the project README. Decisions, trade-offs, open questions, and constraints are all retrievable by branch + file. Copilot users should rely on the human running the CLI; native MCP support arrives when Copilot ships it.
