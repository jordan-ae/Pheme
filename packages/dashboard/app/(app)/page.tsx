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
   shared one from the (app) layout; the active "view" lives in the URL (?view=…)
   so this server component reads it and the client just slices the aggregated
   feed. Entries are scoped per project in the real schema, so we aggregate across
   the user's active (enrolled) projects into one workspace feed. */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { view } = await searchParams;

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
      const { entries } = await listEntries(p.identifier, { status: ALL_STATUSES, limit: 100 });
      return entries.map<DashEntry>((e) => ({
        ...e,
        projectIdentifier: p.identifier,
        projectName: p.name,
      }));
    }),
  );

  const entries: DashEntry[] = settled
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

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
      view={view || "my"}
      user={{ login: session.login, name: session.name, email: session.email }}
      serverError={serverError}
      onboarding={onboarding}
    />
  );
}
