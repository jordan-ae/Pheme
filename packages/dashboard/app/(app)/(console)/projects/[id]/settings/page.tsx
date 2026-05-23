import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { userCanAccess } from "@/lib/access";
import { listAllProjects, type Project } from "@/lib/memory";
import { ProjectManage } from "@/components/project-manage";

export const dynamic = "force-dynamic";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  let projects: Project[] = [];
  try {
    projects = await listAllProjects();
  } catch {
    notFound();
  }
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  try {
    if (!(await userCanAccess(session, project.identifier))) notFound();
  } catch {
    // Can't verify access (App unconfigured). Allow viewing the page chrome but the
    // server action still re-checks access before any mutation.
  }

  const repoName = project.name ?? project.identifier.replace(/^github\.com\//, "");

  return (
    <>
      <header className="page-head">
        <div className="row" style={{ gap: 12 }}>
          <Link href={`/projects/${project.id}`} className="nav-item" style={{ padding: "4px 0" }}>
            ← Back to memory
          </Link>
        </div>
        <span className="eyebrow" style={{ marginTop: 10 }}>
          Manage project
        </span>
        <h1 className="page-title" style={{ marginTop: 12 }}>
          {repoName.split("/").pop()}
        </h1>
        <p className="repo-id" style={{ marginTop: 8 }}>
          {project.identifier}
        </p>
      </header>

      <div className="card" style={{ maxWidth: 620, marginBottom: 22 }}>
        <h3 style={{ fontSize: 18 }}>Details</h3>
        <div className="stack" style={{ gap: 12, marginTop: 14 }}>
          <Detail label="Status" value={project.active ? "Enrolled" : "Off-boarded"} />
          <Detail label="Enrolled by" value={project.enrolledBy ?? "—"} />
          <Detail
            label="GitHub repo"
            value={project.githubRepoId ? `#${project.githubRepoId}` : "Not linked"}
          />
        </div>
      </div>

      <ProjectManage
        projectId={project.id}
        identifier={project.identifier}
        name={repoName}
        active={project.active}
      />
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", gap: 16 }}>
      <span className="text-mute" style={{ fontSize: 13 }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: "var(--ink)" }}>{value}</span>
    </div>
  );
}
