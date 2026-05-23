-- GitHub App installations + project↔repo linkage (dashboard, packages/dashboard).
-- The dashboard authenticates users via the GitHub App (user-to-server OAuth) and
-- reads repo content via installation tokens. We persist installations so the
-- server can mint installation tokens on demand; user identity/session is a
-- stateless signed JWT cookie and needs no table.
-- Paste into Supabase SQL editor (or psql) once per memory-server instance.

CREATE TABLE IF NOT EXISTS github_installations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id TEXT NOT NULL UNIQUE,        -- GitHub App installation id
  account_login   TEXT NOT NULL,               -- org or user the App is installed on
  account_type    TEXT,                        -- "Organization" | "User"
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS github_installations_account_idx ON github_installations (account_login);

-- Link an enrolled project to its GitHub repo + installation. Nullable: a repo can
-- still be enrolled by raw identifier (via `memory init`) without the App.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_repo_id         TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_installation_id TEXT;
