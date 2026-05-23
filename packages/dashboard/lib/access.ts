import "server-only";
import { listAccessibleRepos } from "./github";
import type { Session } from "./auth";

/* Tenancy guard. A user may only act on / view a project whose repo they can reach
   on GitHub through the App's installations. Computed live — no owner column.

   Reads are served from a short-lived per-login cache: the check otherwise hits the
   GitHub API (1 + N installation calls) on every project page view. Writes pass
   { skipCache: true } so a mutation always re-verifies access live — the cache only
   accelerates the read path, and a revoked repo stops being *viewable* within the
   TTL but can never be *mutated* on stale access. Same global-singleton pattern as
   lib/db.ts so the cache survives across requests within a server instance. */

const ACCESS_TTL_MS = 60_000;

declare global {
  // eslint-disable-next-line no-var
  var __repoAccessCache: Map<string, { ids: Set<string>; expires: number }> | undefined;
}

function cache() {
  return (global.__repoAccessCache ??= new Map());
}

async function accessibleIdentifiers(session: Session): Promise<Set<string>> {
  const hit = cache().get(session.login);
  if (hit && hit.expires > Date.now()) return hit.ids;
  const repos = await listAccessibleRepos(session.accessToken);
  const ids = new Set(repos.map((r) => r.identifier));
  cache().set(session.login, { ids, expires: Date.now() + ACCESS_TTL_MS });
  return ids;
}

export async function userCanAccess(
  session: Session,
  identifier: string,
  opts: { skipCache?: boolean } = {},
): Promise<boolean> {
  if (opts.skipCache) {
    const repos = await listAccessibleRepos(session.accessToken);
    return repos.some((r) => r.identifier === identifier);
  }
  return (await accessibleIdentifiers(session)).has(identifier);
}
