import { tool } from "ai";
import { z } from "zod";
import { searchMemory, postLog, postSupersede } from "../lib/memory-client.js";

const entryType = z.enum(["decision", "tradeoff", "question", "constraint"]);

// Per-invocation context passed to tool executors. Lets tools tag entries with
// the originating source/session/branch without re-deriving from environment.
export interface AgentContext {
  sourceId: string;
  sessionId?: string;
  branch: string;
  author: string;
}

export function buildTools(ctx: AgentContext) {
  return {
    search_memory: tool({
      description:
        "Search existing project memory for entries related to a topic. " +
        "Use this BEFORE log_entry to check whether the same decision has already been recorded. " +
        "Use this BEFORE supersede_entry to find the entry being replaced. " +
        "Returns a list of similar entries with a similarity score and the entry id.",
      parameters: z.object({
        query: z.string().describe("Natural-language description of what to look for."),
        limit: z.number().int().positive().max(10).default(5),
        minSimilarity: z
          .number()
          .min(0)
          .max(1)
          .default(0.3)
          .describe("Filter weak matches. 0.3 is a good default."),
      }),
      execute: async ({ query, limit, minSimilarity }) => {
        const result = await searchMemory(query, limit, minSimilarity);
        return {
          query: result.query,
          hitCount: result.results.length,
          hits: result.results.map((r) => ({
            id: r.id,
            type: r.type,
            title: r.title,
            similarity: Math.round(r.similarity * 1000) / 1000,
            rationale: r.rationale,
            tags: r.tags,
          })),
        };
      },
    }),

    log_entry: tool({
      description:
        "Write a new memory entry as ACTIVE. Use only after search_memory confirms this is " +
        "net-new content (not a restatement, not a duplicate). The rationale field is the most " +
        "important field — future agents read it to understand WHY. If you are unsure whether " +
        "the entry is worth writing, use flag_for_review instead.",
      parameters: z.object({
        type: entryType,
        title: z.string().min(10).max(200).describe("Present tense, one sentence."),
        body: z.string().min(20).describe("Full explanation."),
        rationale: z.string().min(20).describe("Why. Required — entries without rationale rot fast."),
        tags: z.array(z.string()).min(1).max(8),
        scope: z
          .enum(["global", "feature", "spike"])
          .default("feature")
          .describe("Default 'feature' for branch-local work. Tech lead promotes to global at merge."),
      }),
      execute: async ({ type, title, body, rationale, tags, scope }) => {
        const result = await postLog({
          type,
          title,
          body,
          rationale,
          tags: dedupTags([...tags, `source:${ctx.sourceId}`, ...sessionTag(ctx)]),
          scope,
          branch: ctx.branch,
          author: ctx.author,
          status: "active",
        });
        return result;
      },
    }),

    supersede_entry: tool({
      description:
        "Mark an existing entry as superseded and write a replacement. Use when memory contains " +
        "an older version of a decision that has been UPDATED (not duplicated, not contradicted). " +
        "The replacement should preserve continuity — explain in the rationale what changed and why. " +
        "You must have the old entry's id from search_memory.",
      parameters: z.object({
        oldEntryId: z.string().uuid().describe("ID of the entry being superseded."),
        type: entryType,
        title: z.string().min(10).max(200),
        body: z.string().min(20),
        rationale: z
          .string()
          .min(30)
          .describe(
            "Required and must mention what changed from the old entry. Future readers need to understand the evolution.",
          ),
        tags: z.array(z.string()).min(1).max(8),
        scope: z.enum(["global", "feature", "spike"]).default("feature"),
      }),
      execute: async ({ oldEntryId, type, title, body, rationale, tags, scope }) => {
        const result = await postSupersede(oldEntryId, {
          type,
          title,
          body,
          rationale,
          tags: dedupTags([...tags, `source:${ctx.sourceId}`, ...sessionTag(ctx)]),
          scope,
          branch: ctx.branch,
          author: ctx.author,
        });
        return result;
      },
    }),

    flag_for_review: tool({
      description:
        "Record an entry that is suggestive but NOT confident enough to publish as active. " +
        "Use this when: confidence < 0.7, the signal is ambiguous, the author intent is unclear, " +
        "or the entry conflicts with an existing decision in a way that requires human judgment. " +
        "Flagged entries are excluded from context bundles until a human confirms them.",
      parameters: z.object({
        type: entryType,
        title: z.string().min(10).max(200),
        body: z.string().min(20),
        rationale: z.string().min(20).describe("What you observed. Be honest about uncertainty."),
        reason: z
          .string()
          .min(10)
          .describe("Why this needs human review (e.g. 'ambiguous: could be decision or trade-off')."),
        tags: z.array(z.string()).min(1).max(8),
      }),
      execute: async ({ type, title, body, rationale, reason, tags }) => {
        const result = await postLog({
          type,
          title,
          body,
          rationale,
          tags: dedupTags([
            ...tags,
            "review:pending",
            `review-reason:${reason.slice(0, 80).replace(/\s+/g, "-").toLowerCase()}`,
            `source:${ctx.sourceId}`,
            ...sessionTag(ctx),
          ]),
          scope: "feature",
          branch: ctx.branch,
          author: ctx.author,
          status: "pending_review",
        });
        return result;
      },
    }),
  };
}

export type ScribeTools = ReturnType<typeof buildTools>;

function sessionTag(ctx: AgentContext): string[] {
  return ctx.sessionId ? [`session:${ctx.sessionId}`] : [];
}

function dedupTags(tags: string[]): string[] {
  return [...new Set(tags)];
}
