import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { memoryEntries } from "../db/schema.js";
import { embedText } from "./embedding.js";

// In-process async embedding. POST /log inserts the row and returns 201 *before*
// this runs, so write confirmation stays under the <100ms NFR while the embedding
// (a slow network call to the provider) happens out of band.
//
// v2 swaps this for a durable queue + a backfill sweep for null embeddings; the
// call site in routes/log.ts does not change when it does.
export function enqueueEmbedding(entryId: string, text: string): void {
  void embedAndStore(entryId, text);
}

async function embedAndStore(entryId: string, text: string): Promise<void> {
  try {
    const embedding = await embedText(text);
    await db
      .update(memoryEntries)
      .set({ embedding, updatedAt: new Date() })
      .where(eq(memoryEntries.id, entryId));
  } catch (err) {
    // The row persists with a null embedding — it simply won't surface in
    // /search until it is re-embedded. /context is unaffected (it filters by
    // type/branch, not vector). Logging is enough for the MVP; the durable
    // queue + backfill is the v2 companion.
    console.error(`[embed-queue] failed to embed entry ${entryId}:`, err);
  }
}
