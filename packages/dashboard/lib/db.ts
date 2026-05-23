import postgres from "postgres";

/* Direct Postgres access, used only for the dashboard-owned github_installations
   table (migration 0007). All memory data goes through the memory-server REST API
   (see lib/memory.ts) so project isolation + auth stay server-side. Same pooled
   single-client pattern as the marketing site. */

declare global {
  // eslint-disable-next-line no-var
  var __dashPgClient: ReturnType<typeof postgres> | undefined;
}

function makeClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return postgres(url, { prepare: false, max: 4, idle_timeout: 30 });
}

export function sql() {
  if (!global.__dashPgClient) {
    global.__dashPgClient = makeClient();
  }
  return global.__dashPgClient;
}

export interface GithubInstallation {
  installation_id: string;
  account_login: string;
  account_type: string | null;
}

/** Upsert a GitHub App installation (called from the install callback). */
export async function saveInstallation(i: GithubInstallation): Promise<void> {
  const db = sql();
  await db`
    INSERT INTO github_installations (installation_id, account_login, account_type)
    VALUES (${i.installation_id}, ${i.account_login}, ${i.account_type})
    ON CONFLICT (installation_id)
    DO UPDATE SET account_login = EXCLUDED.account_login,
                  account_type = EXCLUDED.account_type,
                  updated_at = now()
  `;
}

/** Look up the installation for a GitHub account login (org or user). */
export async function findInstallationByAccount(
  accountLogin: string,
): Promise<GithubInstallation | null> {
  const db = sql();
  const rows = await db<GithubInstallation[]>`
    SELECT installation_id, account_login, account_type
    FROM github_installations
    WHERE lower(account_login) = lower(${accountLogin})
    LIMIT 1
  `;
  return rows[0] ?? null;
}
