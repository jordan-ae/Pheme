import "server-only";
import { listAccessibleRepos } from "./github";
import type { Session } from "./auth";

/* Tenancy guard. A user may only act on / view a project whose repo they can reach
   on GitHub through the App's installations. Computed live — no owner column. */
export async function userCanAccess(session: Session, identifier: string): Promise<boolean> {
  const repos = await listAccessibleRepos(session.accessToken);
  return repos.some((r) => r.identifier === identifier);
}
