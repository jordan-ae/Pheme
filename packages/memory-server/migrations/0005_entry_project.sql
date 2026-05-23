-- Project-scope memory entries (AD-13).
-- Every entry belongs to exactly one enrolled repo; reads are hard-isolated to
-- the caller's project so memory from one repo never leaks into another.
-- Paste into Supabase SQL editor (or psql) once per memory-server instance.
--
-- Safe to re-run: every step is idempotent.

-- 1. Add the column nullable first so the backfill below can populate it before
--    we enforce NOT NULL.
ALTER TABLE memory_entries
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects (id);

-- 2. Ensure the projects that own the existing corpus are enrolled.
--    Identifiers are the canonical git-remote form produced by `memory init`
--    (scheme/user/.git stripped, lower-cased).
INSERT INTO projects (identifier, name, enrolled_by) VALUES
  ('github.com/bleash-dev/phemesh',       'phemesh',       'jordan-ae'),
  ('github.com/bleash-dev/ab-tcf-canada', 'ab-tcf-canada', 'jordan-ae')
ON CONFLICT (identifier) DO UPDATE SET active = true;

-- 3. Backfill ownership of the existing entries.
--    The German/TCF exam work lived on its own feature branch and belongs to the
--    ab-tcf-canada repo; everything else (AD-01..AD-13 and phemesh's own log)
--    belongs to phemesh.
UPDATE memory_entries
SET project_id = (SELECT id FROM projects WHERE identifier = 'github.com/bleash-dev/ab-tcf-canada')
WHERE branch = 'feature/german-exam-profile-poc'
  AND project_id IS NULL;

UPDATE memory_entries
SET project_id = (SELECT id FROM projects WHERE identifier = 'github.com/bleash-dev/phemesh')
WHERE project_id IS NULL;

-- 4. Now that every row is owned, forbid unowned entries going forward.
ALTER TABLE memory_entries
  ALTER COLUMN project_id SET NOT NULL;

-- 5. Index for the per-project filter applied by /context, /search and /log.
CREATE INDEX IF NOT EXISTS memory_entries_project_idx ON memory_entries (project_id);
