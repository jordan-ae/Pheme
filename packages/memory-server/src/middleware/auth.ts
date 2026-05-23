import type { Request, Response, NextFunction } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db/client.js";
import { apiKeys } from "../db/schema.js";
import { keyHash } from "../lib/hash.js";

// Bearer auth (AD-07 v2). Two kinds of key are accepted:
//   • a per-user key (api_keys table) — resolves to an authenticated user email,
//     which routes use as the verified author.
//   • the shared MEMORY_API_KEY — transitional fallback with no verified identity
//     (authKind="shared"); also the admin key allowed to mint per-user keys.
// The shared key is checked first so the common bootstrap path never hits the DB.

const SHARED_KEY = process.env.MEMORY_API_KEY;
if (!SHARED_KEY) {
  throw new Error("MEMORY_API_KEY is not set");
}

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  if (token === SHARED_KEY) {
    res.locals.authKind = "shared";
    res.locals.userEmail = undefined;
    next();
    return;
  }

  try {
    const row = await db.query.apiKeys.findFirst({
      where: and(eq(apiKeys.keyHash, keyHash(token)), isNull(apiKeys.revokedAt)),
    });
    if (!row) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    res.locals.authKind = "user";
    res.locals.userEmail = row.userEmail;
    // Best-effort last-used bookkeeping; never blocks the request.
    void db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, row.id))
      .catch(() => {});
    next();
  } catch (err) {
    console.error("[memory-server] auth lookup failed:", err);
    res.status(500).json({ error: "internal_error" });
  }
}
