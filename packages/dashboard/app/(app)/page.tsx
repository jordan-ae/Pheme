import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listAllProjects, listEntries, listKeys, type Project } from "@/lib/memory";
import { listAccessibleRepos } from "@/lib/github";
import { MemoryDashboard } from "@/components/memory/dashboard";
import { type OnboardingStatus } from "@/components/memory/onboarding-panel";
import { ALL_STATUSES, type DashEntry } from "@/components/memory/format";

export const dynamic = "force-dynamic";

/* The memory-server URL we hand developers to put in their agent config. This is
   the PUBLIC, agent-facing URL, which can differ from the (possibly internal)
   MEMORY_SERVER_URL the dashboard itself uses to reach the server. Operators set
   MEMORY_PUBLIC_URL when they differ; otherwise we fall back to MEMORY_SERVER_URL
   (correct when the whole stack is local) and finally localhost. */
const MEMORY_PUBLIC_URL = (
  process.env.MEMORY_PUBLIC_URL ??
  process.env.MEMORY_SERVER_URL ??
  "http://localhost:4000"
).replace(/\/$/, "");

/* Primary product surface: the dense memory browser. The navigation rail is the
   shared one from the (app) layout. The active "view" lives in the URL (?view=…)
   but is read CLIENT-side (the dashboard's useSearchParams) and the rail switches
   it in place via the History API — so this server component is view-agnostic and
   never re-runs on a view change; it just ships the aggregated feed once and the
   client slices it. Entries are scoped per project in the real schema, so we
   aggregate across the active (enrolled) projects into one workspace feed. */
/* Recent-activity horizon for the aggregated workspace feed. Each active project
   contributes its most-recent entries (PER_PROJECT_LIMIT); after merge+sort we ship
   at most FEED_CAP so the client payload and this server's fan-out are bounded by a
   constant rather than (projects × limit). All client-side views/tabs filter over
   this same set, so the cap defines the feed's recency window — the per-project
   detail page (limit 200, server-filtered) remains the complete, unbounded view. */
const PER_PROJECT_LIMIT = 75;
const FEED_CAP = 250;

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let projects: Project[] = [];
  let serverError = false;
  try {
    projects = await listAllProjects();
  } catch {
    serverError = true;
  }

  const active = projects.filter((p) => p.active);

  // One read per active project, in parallel; individual failures are tolerated.
  const settled = await Promise.allSettled(
    active.map(async (p) => {
      const { entries } = await listEntries(p.identifier, {
        status: ALL_STATUSES,
        limit: PER_PROJECT_LIMIT,
      });
      return entries.map<DashEntry>((e) => ({
        ...e,
        projectIdentifier: p.identifier,
        projectName: p.name,
      }));
    }),
  );

  const entries: DashEntry[] = settled
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, FEED_CAP);

  // First-run onboarding: only computed when the workspace has no memory yet, so
  // the populated dashboard never pays for the extra GitHub/keys round-trips.
  // GitHub install + keys are per-user signals; an enrolled project also implies
  // the App was installed at some point, so it's a safe fallback if the GitHub
  // listing fails.
  let onboarding: OnboardingStatus | undefined;
  if (!serverError && entries.length === 0) {
    const [reposRes, keysRes] = await Promise.allSettled([
      listAccessibleRepos(session.accessToken),
      listKeys(session.email),
    ]);
    const hasInstall =
      active.length > 0 || (reposRes.status === "fulfilled" && reposRes.value.length > 0);
    const hasKey = keysRes.status === "fulfilled" && keysRes.value.some((k) => !k.revokedAt);
    onboarding = {
      hasInstall,
      hasProject: active.length > 0,
      hasKey,
      serverUrl: MEMORY_PUBLIC_URL,
    };
  }

  return (
    <MemoryDashboard
      entries={entries}
      user={{ login: session.login, name: session.name, email: session.email }}
      serverError={serverError}
      onboarding={onboarding}
    />
  );
}
