import type { MemoryEntry } from "../db/schema.js";

export const DEFAULT_MAX_TOKENS = Number.parseInt(
  process.env.MEMORY_BUNDLE_MAX_TOKENS ?? "3000",
  10,
);

export const HARD_CEILING = Number.parseInt(
  process.env.MEMORY_BUNDLE_HARD_CEILING ?? "10000",
  10,
);

// Rough token estimate: ~4 characters per token. Good enough for budget enforcement;
// agents that need exact counts can call their own tokenizer.
export function estimateTokens(entry: MemoryEntry): number {
  const text =
    entry.title.length +
    entry.body.length +
    (entry.rationale?.length ?? 0) +
    entry.tags.join(",").length;
  return Math.ceil(text / 4);
}

export interface BudgetResult {
  included: MemoryEntry[];
  omittedCount: number;
  truncated: boolean;
  tokensUsed: number;
}

/**
 * AD-12: constraints are always included regardless of cap.
 * Other entries are added in order until the cap is reached.
 * Caller should pre-sort `entries` by relevance.
 */
export function applyBudget(
  entries: MemoryEntry[],
  cap: number,
): BudgetResult {
  const included: MemoryEntry[] = [];
  let tokensUsed = 0;
  let omittedCount = 0;

  for (const entry of entries) {
    const cost = estimateTokens(entry);
    if (entry.type === "constraint" || tokensUsed + cost <= cap) {
      included.push(entry);
      tokensUsed += cost;
    } else {
      omittedCount += 1;
    }
  }

  return {
    included,
    omittedCount,
    truncated: omittedCount > 0,
    tokensUsed,
  };
}
