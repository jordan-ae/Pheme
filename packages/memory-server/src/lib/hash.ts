import { createHash } from "node:crypto";

export function contentHash(title: string, body: string): string {
  return createHash("sha256").update(`${title}\n${body}`).digest("hex");
}

// Hash a raw API key for storage/lookup. We never persist the raw key (AD-07 v2).
export function keyHash(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}
