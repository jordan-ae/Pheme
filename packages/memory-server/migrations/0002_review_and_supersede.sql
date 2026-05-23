-- Adds the pending_review status and supersedes_id reference so the scribe agent
-- can flag low-confidence entries for human review and supersede older entries
-- when an updated decision is detected.

-- Postgres can't add an enum value inside a transaction in some versions, so this
-- statement is intentionally standalone. Run separately if your tooling wraps
-- everything in a tx.
ALTER TYPE entry_status ADD VALUE IF NOT EXISTS 'pending_review';

ALTER TABLE memory_entries
  ADD COLUMN IF NOT EXISTS supersedes_id UUID
    REFERENCES memory_entries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS memory_entries_supersedes_idx
  ON memory_entries (supersedes_id) WHERE supersedes_id IS NOT NULL;
