-- Project Memory — initial schema
-- Paste into Supabase SQL editor (or psql) once per project.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

DO $$ BEGIN
  CREATE TYPE entry_type AS ENUM ('decision', 'tradeoff', 'question', 'constraint');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE entry_scope AS ENUM ('global', 'feature', 'spike', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE entry_status AS ENUM ('active', 'superseded', 'archived', 'discarded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS memory_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          entry_type NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  rationale     TEXT,
  author        TEXT,
  branch        TEXT NOT NULL DEFAULT 'global',
  scope         entry_scope NOT NULL DEFAULT 'global',
  tags          TEXT[] NOT NULL DEFAULT '{}',
  status        entry_status NOT NULL DEFAULT 'active',
  embedding     vector(1536),
  content_hash  TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS memory_entries_branch_idx ON memory_entries (branch);
CREATE INDEX IF NOT EXISTS memory_entries_type_idx ON memory_entries (type);
CREATE INDEX IF NOT EXISTS memory_entries_status_idx ON memory_entries (status);
CREATE INDEX IF NOT EXISTS memory_entries_tags_idx ON memory_entries USING GIN (tags);

-- HNSW index for fast cosine similarity search.
-- Built lazily once data is present; safe to create on an empty table.
CREATE INDEX IF NOT EXISTS memory_entries_embedding_idx
  ON memory_entries USING hnsw (embedding vector_cosine_ops);
