import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listAccessibleRepos, type GitHubRepo } from "@/lib/github";
import { listAllProjects, type Project } from "@/lib/memory";
import { RepoCard, type RepoCardData } from "@/components/repo-card";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ installed?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { installed } = await searchParams;

  let repos: GitHubRepo[] = [];
  let projects: Project[] = [];
  let ghError = false;
  let memError = false;

  try {
    repos = await listAccessibleRepos(session.accessToken);
  } catch {
    ghError = true;
  }
  try {
    projects = await listAllProjects();
  } catch {
    memError = true;
  }

  const byIdentifier = new Map(projects.map((p) => [p.identifier, p]));
  const cards: RepoCardData[] = repos.map((r) => {
    const project = byIdentifier.get(r.identifier);
    return {
      identifier: r.identifier,
      fullName: r.fullName,
      description: r.description,
      private: r.private,
      githubRepoId: String(r.id),
      githubInstallationId: r.installationId,
      project: project ? { id: project.id, active: project.active } : null,
    };
  });

  const enrolledCount = cards.filter((c) => c.project?.active).length;

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Projects</span>
        <h1 className="page-title">Your repositories</h1>
        <p className="page-desc">
          Repositories your GitHub account can reach through the Pheme App. Enroll one to start
          collecting decisions, constraints, and trade-offs — then browse them here.
        </p>
      </header>

      {installed && (
        <div className="callout" style={{ marginBottom: 22 }}>
          GitHub App installed. The repositories it can access now appear below.
        </div>
      )}

      {memError && (
        <div className="callout callout-warn" style={{ marginBottom: 22 }}>
          Couldn&apos;t reach the memory server. Check <span className="mono">MEMORY_SERVER_URL</span>{" "}
          and <span className="mono">MEMORY_API_KEY</span>.
        </div>
      )}

      {ghError ? (
        <div className="empty">
          <h3>Connect GitHub to get started</h3>
          <p>
            Install the Pheme GitHub App and choose which repositories it can access. They&apos;ll
            show up here, ready to enroll.
          </p>
          <Link href="/connect" className="btn btn-primary">
            Connect GitHub
          </Link>
        </div>
      ) : cards.length === 0 ? (
        <div className="empty">
          <h3>No repositories yet</h3>
          <p>
            The Pheme App isn&apos;t installed on any repositories your account can access. Install
            it and pick some repos to begin.
          </p>
          <Link href="/connect" className="btn btn-primary">
            Connect repositories
          </Link>
        </div>
      ) : (
        <>
          <div className="row" style={{ gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
            <span className="badge badge-enrolled">
              <span className="badge-dot" /> {enrolledCount} enrolled
            </span>
            <span className="badge">
              <span className="badge-dot" /> {cards.length} accessible
            </span>
            <Link href="/connect" className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>
              Manage GitHub access
            </Link>
          </div>
          <div className="grid-cards">
            {cards.map((c) => (
              <RepoCard key={c.identifier} data={c} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
