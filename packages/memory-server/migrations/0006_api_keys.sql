-- Per-user API keys (AD-07 v2, greenlit by tech-lead sign-off 2026-05-23).
-- Replaces shared-key-only auth: the server derives an authenticated author from
-- the presented key. Only the SHA-256 hash of each key is stored, never the raw
-- value. The shared MEMORY_API_KEY remains a transitional fallback.
-- Paste into Supabase SQL editor (or psql) once per memory-server instance.

CREATE TABLE IF NOT EXISTS api_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash      TEXT NOT NULL UNIQUE,        -- sha256(rawKey)
  user_email    TEXT NOT NULL,
  label         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at  TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ                  -- non-null => revoked
);

CREATE INDEX IF NOT EXISTS api_keys_user_idx ON api_keys (user_email);
