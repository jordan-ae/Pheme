import { Router } from "express";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../db/client.js";
import { apiKeys } from "../db/schema.js";
import { keyHash } from "../lib/hash.js";

// Per-user API key lifecycle (AD-07 v2). All three routes are admin-gated to the
// shared MEMORY_API_KEY: the dashboard server holds the admin key and acts on
// behalf of the signed-in user, scoping every call to that user's email. Raw keys
// are returned exactly once at mint; only the SHA-256 hash is ever stored.

const MintSchema = z.object({
  userEmail: z.string().email().max(200),
  label: z.string().max(200).optional(),
});

const ListSchema = z.object({
  userEmail: z.string().email().max(200),
});

const RevokeParams = z.object({ id: z.string().uuid() });
const RevokeQuery = z.object({ userEmail: z.string().email().max(200) });

export const keysRouter: Router = Router();

// Public shape of a key — never includes the hash or raw value.
function publicKey(row: typeof apiKeys.$inferSelect) {
  return {
    id: row.id,
    userEmail: row.userEmail,
    label: row.label,
    createdAt: row.createdAt,
    lastUsedAt: row.lastUsedAt,
    revokedAt: row.revokedAt,
  };
}

function requireAdmin(res: import("express").Response): boolean {
  if (res.locals.authKind !== "shared") {
    res.status(403).json({
      error: "admin_required",
      message: "Managing keys requires the shared MEMORY_API_KEY (admin).",
    });
    return false;
  }
  return true;
}

keysRouter.post("/keys", async (req, res) => {
  if (!requireAdmin(res)) return;

  const parsed = MintSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
    return;
  }
  const { userEmail, label } = parsed.data;

  const rawKey = `pmk_${randomBytes(24).toString("hex")}`;
  const [created] = await db
    .insert(apiKeys)
    .values({ keyHash: keyHash(rawKey), userEmail, label })
    .returning({ id: apiKeys.id, userEmail: apiKeys.userEmail, createdAt: apiKeys.createdAt });

  if (!created) {
    res.status(500).json({ error: "insert_failed" });
    return;
  }

  // The only time the raw key is ever exposed.
  res.status(201).json({ apiKey: rawKey, key: created });
});

// List a user's keys (no hashes, no raw values). Includes revoked keys so the UI
// can show full history; the dashboard scopes ?userEmail to the session user.
keysRouter.get("/keys", async (req, res) => {
  if (!requireAdmin(res)) return;

  const parsed = ListSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
    return;
  }

  const rows = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userEmail, parsed.data.userEmail))
    .orderBy(desc(apiKeys.createdAt));

  res.json({ keys: rows.map(publicKey) });
});

// Revoke a key (soft — sets revokedAt; never deleted, mirroring AD-10). Requires
// the owning userEmail and only revokes a still-active key belonging to that user,
// so one user can never revoke another's key even through the admin path.
keysRouter.delete("/keys/:id", async (req, res) => {
  if (!requireAdmin(res)) return;

  const params = RevokeParams.safeParse(req.params);
  const query = RevokeQuery.safeParse(req.query);
  if (!params.success || !query.success) {
    res.status(400).json({ error: "invalid_input" });
    return;
  }

  const [revoked] = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(apiKeys.id, params.data.id),
        eq(apiKeys.userEmail, query.data.userEmail),
        isNull(apiKeys.revokedAt),
      ),
    )
    .returning();

  if (!revoked) {
    res.status(404).json({ error: "not_found", message: "No active key for that user and id." });
    return;
  }

  res.json({ revoked: publicKey(revoked) });
});
