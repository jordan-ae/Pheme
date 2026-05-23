import { Router } from "express";
import { z } from "zod";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { memoryEntries } from "../db/schema.js";
import { embedText } from "../lib/embedding.js";
import { resolveProject } from "../middleware/project.js";

const SearchQuerySchema = z.object({
  q: z.string().min(1).max(2000),
  limit: z.coerce.number().int().positive().max(20).default(5),
  minSimilarity: z.coerce.number().min(0).max(1).default(0.2),
});

export const searchRouter: Router = Router();

searchRouter.get("/search", resolveProject, async (req, res) => {
  const parsed = SearchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
    return;
  }
  const { q, limit, minSimilarity } = parsed.data;
  const projectId = res.locals.projectId as string;

  const queryVec = await embedText(q);
  const similarity = sql<number>`1 - (${cosineDistance(memoryEntries.embedding, queryVec)})`;

  const rows = await db
    .select({
      id: memoryEntries.id,
      type: memoryEntries.type,
      title: memoryEntries.title,
      body: memoryEntries.body,
      rationale: memoryEntries.rationale,
      author: memoryEntries.author,
      branch: memoryEntries.branch,
      scope: memoryEntries.scope,
      tags: memoryEntries.tags,
      status: memoryEntries.status,
      createdAt: memoryEntries.createdAt,
      similarity,
    })
    .from(memoryEntries)
    .where(
      and(
        eq(memoryEntries.status, "active"),
        eq(memoryEntries.projectId, projectId),
        gt(similarity, minSimilarity),
      ),
    )
    .orderBy(desc(similarity))
    .limit(limit);

  res.json({ query: q, results: rows });
});
