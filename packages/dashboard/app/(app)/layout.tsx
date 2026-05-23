import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listAllProjects, type Project } from "@/lib/memory";
import { AppShell } from "@/components/app-shell";
import { type DashProject, type DashTeam } from "@/components/app-sidebar";

/* Auth boundary + the app shell for the whole product. The dense navigation rail
   lives here (via AppShell) so the home dashboard ("/") AND every console page
   share one and the same collapsible sidebar. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  let projects: Project[] = [];
  try {
    projects = await listAllProjects();
  } catch {
    // Rail still renders (no projects listed) if the memory server is unreachable.
  }
  const railProjects: DashProject[] = projects
    .filter((p) => p.active)
    .map((p) => ({ id: p.id, identifier: p.identifier, name: p.name }));

  // No teams backend exists yet — the rail renders an empty Teams section until
  // a teams data source is added. Populate this array from the server then.
  const railTeams: DashTeam[] = [];

  return (
    <AppShell
      user={{
        name: session.name,
        login: session.login,
        email: session.email,
        avatarUrl: session.avatarUrl,
      }}
      projects={railProjects}
      teams={railTeams}
    >
      {children}
    </AppShell>
  );
}
