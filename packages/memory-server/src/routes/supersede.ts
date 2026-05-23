import { Router } from "express";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { memoryEntries } from "../db/schema.js";
import { embedText } from "../lib/embedding.js";
import { contentHash } from "../lib/hash.js";
import { resolveProject } from "../middleware/project.js";

const SupersedeBodySchema = z.object({
  type: z.enum(["decision", "tradeoff", "question", "constraint"]),
  title: z.string().min(1).max(500),
  body: z.string().min(1),
  rationale: z.string().optional(),
  author: z.string().optional(),
  branch: z.string().default("global"),
  scope: z.enum(["global", "feature", "spike", "archived"]).default("global"),
  tags: z.array(z.string()).default([]),
});

const ParamsSchema = z.object({
  id: z.string().uuid(),
});

export const supersedeRouter: Router = Router();

supersedeRouter.post("/entries/:id/supersede", resolveProject, async (req, res) => {
  const params = ParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  const body = SupersedeBodySchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid_input", details: body.error.flatten() });
    return;
  }

  const oldId = params.data.id;
  const replacement = body.data;
  const projectId = res.locals.projectId as string;
  const userEmail = res.locals.userEmail as string | undefined;

  const oldEntry = await db.query.memoryEntries.findFirst({
    where: eq(memoryEntries.id, oldId),
  });
  // Hard isolation (AD-13): an entry owned by another project is not visible
  // here, so superseding it is a 404 rather than a cross-project write.
  if (!oldEntry || oldEntry.projectId !== projectId) {
    res.status(404).json({ error: "not_found", id: oldId });
    return;
  }
  if (oldEntry.status !== "active") {
    res.status(409).json({
      error: "not_active",
      message: `Cannot supersede entry with status='${oldEntry.status}'. Only active entries can be superseded.`,
      currentStatus: oldEntry.status,
    });
    return;
  }

  const hash = contentHash(replacement.title, replacement.body);
  const dup = await db.query.memoryEntries.findFirst({
    where: eq(memoryEntries.contentHash, hash),
  });
  if (dup) {
    res.status(409).json({ error: "duplicate_replacement", entryId: dup.id });
    return;
  }

  const embedding = await embedText(
    [replacement.title, replacement.body, replacement.rationale ?? ""].join("\n"),
  );

  const result = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(memoryEntries)
      .values({
        ...replacement,
        // A replacement stays in the same project as the entry it supersedes;
        // authorship is the authenticated user when present (AD-07 v2).
        projectId,
        author: userEmail ?? replacement.author ?? null,
        contentHash: hash,
        embedding,
        supersedesId: oldId,
      })
      .returning();

    if (!inserted) {
      throw new Error("insert_failed: replacement entry not returned");
    }

    const [oldUpdated] = await tx
      .update(memoryEntries)
      .set({ status: "superseded", updatedAt: new Date() })
      .where(and(eq(memoryEntries.id, oldId), eq(memoryEntries.status, "active")))
      .returning();

    if (!oldUpdated) {
      // Someone else moved the old entry out of 'active' between our read and write.
      // Roll back by throwing — the tx aborts and no rows are written.
      throw new Error("race_condition: old entry no longer active");
    }

    return { newEntry: inserted, supersededEntry: oldUpdated };
  });

  res.status(201).json({
    newEntry: strip(result.newEntry),
    supersededEntry: strip(result.supersededEntry),
  });
});

function strip<T extends { embedding: unknown }>(row: T) {
  const { embedding: _omit, ...rest } = row;
  return rest;
}
