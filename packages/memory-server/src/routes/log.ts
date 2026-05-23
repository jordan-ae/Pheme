import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { memoryEntries } from "../db/schema.js";
import { enqueueEmbedding } from "../lib/embed-queue.js";
import { contentHash } from "../lib/hash.js";
import { resolveProject } from "../middleware/project.js";

const LogEntrySchema = z.object({
  type: z.enum(["decision", "tradeoff", "question", "constraint"]),
  title: z.string().min(1).max(500),
  body: z.string().min(1),
  rationale: z.string().optional(),
  author: z.string().optional(),
  branch: z.string().default("global"),
  scope: z.enum(["global", "feature", "spike", "archived"]).default("global"),
  tags: z.array(z.string()).default([]),
  // The scribe agent uses 'pending_review' to flag low-confidence entries
  // for human confirmation; superseded/archived/discarded are state-transition
  // targets owned by dedicated endpoints, not this write path.
  status: z.enum(["active", "pending_review"]).default("active"),
});

export const logRouter: Router = Router();

logRouter.post("/log", resolveProject, async (req, res) => {
  const parsed = LogEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
    return;
  }
  const entry = parsed.data;
  const projectId = res.locals.projectId as string;

  // Authorship comes from the authenticated key when one is presented (AD-07 v2):
  // a verified identity overrides anything the client claims. Shared-key callers
  // have no verified identity, so they fall back to the self-reported author.
  const userEmail = res.locals.userEmail as string | undefined;
  const author = userEmail ?? entry.author ?? null;

  const hash = contentHash(entry.title, entry.body);

  const existing = await db.query.memoryEntries.findFirst({
    where: eq(memoryEntries.contentHash, hash),
  });
  if (existing) {
    res.status(409).json({ error: "duplicate", entryId: existing.id });
    return;
  }

  // Insert immediately with no embedding so the write confirms in <100ms (NFR),
  // then embed out of band. The entry is durable the moment we return 201; it
  // just isn't searchable until enqueueEmbedding backfills the vector.
  const [inserted] = await db
    .insert(memoryEntries)
    .values({ ...entry, author, projectId, contentHash: hash, embedding: null })
    .returning();

  if (!inserted) {
    res.status(500).json({ error: "insert_failed" });
    return;
  }

  res.status(201).json({ id: inserted.id, entry: stripEmbedding(inserted) });

  enqueueEmbedding(inserted.id, [entry.title, entry.body, entry.rationale ?? ""].join("\n"));
});

function stripEmbedding<T extends { embedding: unknown }>(row: T) {
  const { embedding: _omit, ...rest } = row;
  return rest;
}
