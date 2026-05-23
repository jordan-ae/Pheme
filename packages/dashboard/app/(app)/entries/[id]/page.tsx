import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listAllProjects, listEntries, type Project } from "@/lib/memory";
import { ALL_STATUSES, type DashEntry } from "@/components/memory/format";
import { EntryFullView } from "@/components/memory/dash-detail";
import s from "@/components/memory/dashboard.module.css";

export const dynamic = "force-dynamic";

/* The full-page view of a single entry — the destination of the detail panel's
   "expand" control. The memory-server has no by-id read (entries are project-
   scoped, AD-13), so we resolve the entry the same way the home feed builds its
   list: one read per active project, in parallel, failures tolerated, then match
   on id. Rendered inside the dashboard's themed `.root` so it shares the dense
   dark surface, beside the shared (app) rail. */
export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  let projects: Project[] = [];
  try {
    projects = await listAllProjects();
  } catch {
    // Server unreachable — treat as not found rather than crashing the route.
  }
  const active = projects.filter((p) => p.active);

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

  const entry = settled
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .find((e) => e.id === id);

  if (!entry) notFound();

  return (
    <div className={s.root}>
      <EntryFullView entry={entry} />
    </div>
  );
}
