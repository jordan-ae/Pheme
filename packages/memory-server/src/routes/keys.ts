import { Router } from "express";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { db } from "../db/client.js";
import { apiKeys } from "../db/schema.js";
import { keyHash } from "../lib/hash.js";

// Mint per-user API keys (AD-07 v2). Gated to the shared MEMORY_API_KEY, which
// acts as the admin/bootstrap key — only an admin issues identities. The raw key
// is returned exactly once; only its hash is stored.

const MintSchema = z.object({
  userEmail: z.string().email().max(200),
  label: z.string().max(200).optional(),
});

export const keysRouter: Router = Router();

keysRouter.post("/keys", async (req, res) => {
  if (res.locals.authKind !== "shared") {
    res.status(403).json({
      error: "admin_required",
      message: "Minting keys requires the shared MEMORY_API_KEY (admin).",
    });
    return;
  }

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
