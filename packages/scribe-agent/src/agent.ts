import { generateText } from "ai";
import { getScribeModel, SCRIBE_MODEL_DESCRIPTION } from "./lib/model.js";
import { buildTools, type AgentContext, type ScribeTools } from "./tools/index.js";

const SCRIBE_SYSTEM_PROMPT = `You are the Project Memory scribe. You read agent transcripts, design docs, meeting notes, PR comments, and other team output. Your job is to keep project memory current and accurate without bloating it.

TOOLS AVAILABLE
- search_memory: find related existing entries. ALWAYS call this before log_entry or supersede_entry.
- log_entry: write a new active entry. Only after search_memory shows nothing close.
- supersede_entry: replace an existing entry when a decision has been UPDATED. The rationale must explain what changed.
- flag_for_review: when you're not confident enough to publish as active.

REASONING LOOP
1. Read the input. Identify candidate log-worthy items — decisions, trade-offs, open questions, constraints.
2. For each candidate, call search_memory with a focused query.
3. Decide:
   - net-new + high confidence → log_entry
   - updated version of an existing entry → supersede_entry (with the matched id)
   - ambiguous, low-confidence, or in conflict with existing → flag_for_review
   - duplicate or restatement → skip silently
4. Continue until all candidates are processed. Then stop.

ENTRY TYPES
- decision: a real choice between alternatives. Record what was chosen and why.
- tradeoff: a downside deliberately accepted. Prevents future agents "fixing" intentional choices.
- question: something unresolved that matters. The author doesn't know the answer.
- constraint: a hard rule from a human reviewer ("must", "cannot", "non-negotiable"). Highest priority.

WHAT TO IGNORE
- Tool calls, file reads, code edits — these are agent mechanics, not decisions.
- Status updates ("starting work on X", "running tests").
- Trivial fixes (typos, formatting, lint).
- Restatements of context already documented in the codebase or memory.

QUALITY BAR
- Title: one sentence, present tense, falsifiable.
- Rationale: minimum two sentences. WHY — not WHAT. Survive context loss.
- Tags: 2-8 kebab-case strings. Include topic + domain.
- Be strict. An empty turn (no entries written) is correct and expected for most inputs.

OUTPUT
You don't return text to the user. You make tool calls. The system records what you did.`;

export interface RunAgentInput {
  text: string;
  sourceId: string;
  sessionId?: string;
  branch?: string;
  author?: string;
}

export interface RunAgentResult {
  model: string;
  steps: number;
  toolCalls: number;
  written: number;
  flagged: number;
  superseded: number;
  searches: number;
  summary: string;
}

const MAX_STEPS = Number.parseInt(process.env.SCRIBE_MAX_STEPS ?? "10", 10);
const TEMPERATURE = Number.parseFloat(process.env.SCRIBE_TEMPERATURE ?? "0.2");
const MAX_INPUT_CHARS = Number.parseInt(process.env.SCRIBE_MAX_INPUT_CHARS ?? "120000", 10);

export async function runScribeAgent(input: RunAgentInput): Promise<RunAgentResult> {
  const text =
    input.text.length > MAX_INPUT_CHARS ? input.text.slice(-MAX_INPUT_CHARS) : input.text;

  const ctx: AgentContext = {
    sourceId: input.sourceId,
    sessionId: input.sessionId,
    branch: input.branch ?? "global",
    author: input.author ?? `scribe:${input.sourceId}`,
  };

  const tools: ScribeTools = buildTools(ctx);

  const userPrompt = [
    `Source: ${ctx.sourceId}`,
    `Branch: ${ctx.branch}`,
    ctx.sessionId ? `Session: ${ctx.sessionId}` : null,
    "",
    "Process the following content and update project memory as appropriate. Use the tools — do not output prose.",
    "",
    "--- BEGIN CONTENT ---",
    text,
    "--- END CONTENT ---",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const result = await generateText({
    model: getScribeModel(),
    system: SCRIBE_SYSTEM_PROMPT,
    prompt: userPrompt,
    tools,
    maxSteps: MAX_STEPS,
    temperature: TEMPERATURE,
  });

  // Tally what actually happened via the recorded tool calls.
  let written = 0;
  let flagged = 0;
  let superseded = 0;
  let searches = 0;

  for (const step of result.steps) {
    for (const call of step.toolCalls ?? []) {
      switch (call.toolName) {
        case "search_memory":
          searches += 1;
          break;
        case "log_entry":
          written += 1;
          break;
        case "supersede_entry":
          superseded += 1;
          break;
        case "flag_for_review":
          flagged += 1;
          break;
      }
    }
  }

  return {
    model: SCRIBE_MODEL_DESCRIPTION,
    steps: result.steps.length,
    toolCalls: written + flagged + superseded + searches,
    written,
    flagged,
    superseded,
    searches,
    summary: result.text || "(no narrative — tool-only)",
  };
}
