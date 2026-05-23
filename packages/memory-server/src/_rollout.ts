// One-off rollout runner (no psql available). Applies migrations 0005 + 0006
// idempotently against DATABASE_URL, with a guard before enforcing NOT NULL.
// Deleted after use — the .sql files remain the source of truth.
import "./lib/load-env.js";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not set");
const sql = postgres(url, { prepare: false });

const PHEME = "github.com/jordan-ae/pheme";
const ABTCF = "github.com/bleash-dev/ab-tcf-canada";

async function main() {
  console.log("== rollout: projects + 0005 (project_id) + 0006 (api_keys) ==");

  // projects registry (0004) — idempotent safety net in case it wasn't applied.
  await sql.unsafe(`CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT UNIQUE NOT NULL,
    name TEXT,
    enrolled_by TEXT,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    active BOOLEAN NOT NULL DEFAULT true
  )`);
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS projects_active_idx ON projects (active)`);

  // 0005: add the column nullable, enroll owners, backfill, then enforce.
  await sql.unsafe(
    `ALTER TABLE memory_entries ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id)`,
  );

  await sql`INSERT INTO projects (identifier, name, enrolled_by) VALUES
    (${PHEME}, 'pheme', 'jordan-ae'),
    (${ABTCF}, 'ab-tcf-canada', 'jordan-ae')
    ON CONFLICT (identifier) DO UPDATE SET active = true`;

  const ab = await sql`UPDATE memory_entries
    SET project_id = (SELECT id FROM projects WHERE identifier = ${ABTCF})
    WHERE branch = 'feature/german-exam-profile-poc' AND project_id IS NULL`;
  const ph = await sql`UPDATE memory_entries
    SET project_id = (SELECT id FROM projects WHERE identifier = ${PHEME})
    WHERE project_id IS NULL`;
  console.log(`backfill: ab-tcf-canada=${ab.count} updated, pheme=${ph.count} updated`);

  const nullRows = await sql`SELECT count(*)::int AS n FROM memory_entries WHERE project_id IS NULL`;
  const nulls = nullRows[0]?.n ?? 0;
  if (nulls > 0) {
    console.error(`ABORT: ${nulls} entries still unowned; leaving project_id nullable.`);
  } else {
    await sql.unsafe(`ALTER TABLE memory_entries ALTER COLUMN project_id SET NOT NULL`);
    console.log("project_id -> NOT NULL enforced");
  }
  await sql.unsafe(
    `CREATE INDEX IF NOT EXISTS memory_entries_project_idx ON memory_entries (project_id)`,
  );

  // 0006: api_keys
  await sql.unsafe(`CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_hash TEXT NOT NULL UNIQUE,
    user_email TEXT NOT NULL,
    label TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
  )`);
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS api_keys_user_idx ON api_keys (user_email)`);

  // verify
  const counts = await sql`SELECT p.identifier, count(e.id)::int AS n
    FROM projects p LEFT JOIN memory_entries e ON e.project_id = p.id
    GROUP BY p.identifier ORDER BY p.identifier`;
  console.log("\n== per-project active+all entry counts ==");
  for (const r of counts) console.log(`  ${r.identifier}: ${r.n}`);

  const apiKeysExists = await sql`SELECT to_regclass('public.api_keys') IS NOT NULL AS ok`;
  console.log(`\napi_keys table present: ${apiKeysExists[0]?.ok}`);

  await sql.end();
  console.log("\n== rollout complete ==");
}

main().catch(async (e) => {
  console.error("rollout failed:", e);
  await sql.end();
  process.exit(1);
});
