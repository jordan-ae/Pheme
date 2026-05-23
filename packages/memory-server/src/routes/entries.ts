import { Router } from "express";
import { z } from "zod";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { memoryEntries } from "../db/schema.js";
import { resolveProject } from "../middleware/project.js";

// Browse a project's memory for the dashboard detail view. Unlike /context (which
// returns a right-sized active-only bundle, AD-06/AD-12) and /search (semantic),
// this is a plain paginated list filterable by type/status/branch — so the UI can
// show full history including superseded/archived entries (AD-10). Hard-isolated to
// the caller's project via resolveProject (AD-13).

const csv = (v: unknown) =>
  typeof v === "string" && v.length > 0 ? v.split(",").map((s) => s.trim()) : undefined;

const EntriesQuerySchema = z.object({
  type: z.preprocess(
    csv,
    z.array(z.enum(["decision", "tradeoff", "question", "constraint"])).optional(),
  ),
  status: z.preprocess(
    csv,
    z
      .array(z.enum(["active", "superseded", "archived", "discarded", "pending_review"]))
      .default(["active"]),
  ),
  branch: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export const entriesRouter: Router = Router();

entriesRouter.get("/entries", resolveProject, async (req, res) => {
  const parsed = EntriesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
    return;
  }
  const { type, status, branch, limit, offset } = parsed.data;
  const projectId = res.locals.projectId as string;

  const filters = [eq(memoryEntries.projectId, projectId), inArray(memoryEntries.status, status)];
  if (type && type.length > 0) filters.push(inArray(memoryEntries.type, type));
  // A branch filter still includes global so the project's baseline always shows.
  if (branch) filters.push(or(eq(memoryEntries.branch, "global"), eq(memoryEntries.branch, branch))!);

  const where = and(...filters);

  const [rows, counted] = await Promise.all([
    db
      .select()
      .from(memoryEntries)
      .where(where)
      .orderBy(desc(memoryEntries.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(memoryEntries)
      .where(where),
  ]);

  res.json({
    entries: rows.map(strip),
    total: counted[0]?.count ?? 0,
    limit,
    offset,
  });
});

function strip<T extends { embedding: unknown }>(row: T) {
  const { embedding: _omit, ...rest } = row;
  return rest;
}
