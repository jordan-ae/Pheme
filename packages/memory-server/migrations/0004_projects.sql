-- Opt-in project registry (SRS §4, §10).
-- A repo is enrolled by registering its canonical git remote URL via `memory init`.
-- Paste into Supabase SQL editor (or psql) once per memory-server instance.

CREATE TABLE IF NOT EXISTS projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier   TEXT UNIQUE NOT NULL,        -- canonical git remote URL, e.g. github.com/org/repo
  name         TEXT,
  enrolled_by  TEXT,
  enrolled_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  active       BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS projects_active_idx ON projects (active);
