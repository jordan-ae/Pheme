import { Router } from "express";
import { z } from "zod";
import { and, eq, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { memoryEntries, type MemoryEntry } from "../db/schema.js";
import { applyBudget, DEFAULT_MAX_TOKENS, HARD_CEILING } from "../lib/budget.js";
import { resolveProject } from "../middleware/project.js";

// Return undefined (not []) when the param is absent, so the Zod `.default()`
// on each field actually fires. Returning [] suppresses the default, which
// silently emptied the bundle whenever `types` was omitted.
const csv = (v: unknown) =>
  typeof v === "string" && v.length > 0 ? v.split(",").map((s) => s.trim()) : undefined;

const ContextQuerySchema = z.object({
  branch: z.string().default("global"),
  files: z.preprocess(csv, z.array(z.string()).default([])),
  types: z.preprocess(
    csv,
    z.array(z.enum(["decision", "tradeoff", "question", "constraint"])).default([
      "decision",
      "tradeoff",
      "question",
      "constraint",
    ]),
  ),
  maxTokens: z.coerce.number().int().positive().max(HARD_CEILING).optional(),
});

export const contextRouter: Router = Router();

contextRouter.get("/context", resolveProject, async (req, res) => {
  const parsed = ContextQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
    return;
  }
  const { branch, files, types, maxTokens } = parsed.data;
  const cap = maxTokens ?? DEFAULT_MAX_TOKENS;
  const projectId = res.locals.projectId as string;

  // Constraints are always included (AD-12) regardless of scope/branch — but only
  // within this project (AD-13). Without the project filter, every repo's
  // constraints leaked into every other repo's bundle.
  const constraints = await db
    .select()
    .from(memoryEntries)
    .where(
      and(
        eq(memoryEntries.type, "constraint"),
        eq(memoryEntries.status, "active"),
        eq(memoryEntries.projectId, projectId),
      ),
    );

  // Other types: scope chain = global + this branch, within this project.
  const nonConstraintTypes = types.filter((t) => t !== "constraint");

  let others: MemoryEntry[] = [];
  if (nonConstraintTypes.length > 0) {
    others = await db
      .select()
      .from(memoryEntries)
      .where(
        and(
          ne(memoryEntries.type, "constraint"),
          eq(memoryEntries.status, "active"),
          eq(memoryEntries.projectId, projectId),
          inArray(memoryEntries.type, nonConstraintTypes),
          or(eq(memoryEntries.branch, "global"), eq(memoryEntries.branch, branch)),
        ),
      );
  }

  // File scoping: if files are provided, prefer entries whose tags overlap.
  // We don't drop non-matching entries entirely — they sort to the back instead,
  // so an under-tagged corpus still returns useful context.
  const fileSet = new Set(files);
  const ranked = files.length
    ? [...others].sort((a, b) => tagOverlap(b, fileSet) - tagOverlap(a, fileSet))
    : others;

  const budget = applyBudget(ranked, cap);

  res.json({
    branch,
    cap,
    constraints: constraints.map(strip),
    entries: budget.included.map(strip),
    truncated: budget.truncated,
    omittedCount: budget.omittedCount,
    tokensUsed: budget.tokensUsed,
  });
});

function tagOverlap(entry: MemoryEntry, fileSet: Set<string>): number {
  let n = 0;
  for (const tag of entry.tags) {
    if (fileSet.has(tag)) n += 1;
  }
  return n;
}

function strip<T extends { embedding: unknown }>(row: T) {
  const { embedding: _omit, ...rest } = row;
  return rest;
}

// silence unused-sql warning if we extend later
void sql;
