import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { userCanAccess } from "@/lib/access";
import {
  listAllProjects,
  listEntries,
  searchEntries,
  type EntryType,
  type EntryStatus,
  type MemoryEntry,
  type Project,
} from "@/lib/memory";
import { EntryCard } from "@/components/entry-card";
import { EntryFilters } from "@/components/entry-filters";

export const dynamic = "force-dynamic";

const ALL_STATUSES: EntryStatus[] = [
  "active",
  "superseded",
  "archived",
  "discarded",
  "pending_review",
];
const SECTION_ORDER: { type: EntryType; label: string }[] = [
  { type: "decision", label: "Decisions" },
  { type: "constraint", label: "Constraints" },
  { type: "tradeoff", label: "Trade-offs" },
  { type: "question", label: "Open questions" },
];

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; q?: string; history?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const sp = await searchParams;

  let projects: Project[] = [];
  try {
    projects = await listAllProjects();
  } catch {
    return (
      <ErrorState title="Memory server unreachable">
        Couldn&apos;t reach the memory server. Check <span className="mono">MEMORY_SERVER_URL</span>{" "}
        and <span className="mono">MEMORY_API_KEY</span>.
      </ErrorState>
    );
  }

  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  // Tenancy: confirm the user can still reach this repo on GitHub.
  let ghConfigured = true;
  try {
    if (!(await userCanAccess(session, project.identifier))) notFound();
  } catch {
    ghConfigured = false; // can't verify (App not configured) — show a notice, no data leak
  }

  const repoName = project.name ?? project.identifier.replace(/^github\.com\//, "");

  return (
    <>
      <header className="page-head">
        <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          <span className="eyebrow">Project memory</span>
          {project.active ? (
            <span className="badge badge-enrolled">
              <span className="badge-dot" /> Enrolled
            </span>
          ) : (
            <span className="badge badge-offboarded">
              <span className="badge-dot" /> Off-boarded
            </span>
          )}
          <Link
            href={`/projects/${project.id}/settings`}
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: "auto" }}
          >
            Manage project
          </Link>
        </div>
        <h1 className="page-title" style={{ marginTop: 14 }}>
          {repoName.split("/").pop()}
        </h1>
        <p className="repo-id" style={{ marginTop: 8 }}>
          {project.identifier}
        </p>
      </header>

      {!project.active ? (
        <div className="empty">
          <h3>This project is off-boarded</h3>
          <p>
            Memory collection is stopped and existing entries are frozen out of agent context.
            Re-enroll it from the management page to read and resume its memory.
          </p>
          <Link href={`/projects/${project.id}/settings`} className="btn btn-primary">
            Manage project
          </Link>
        </div>
      ) : !ghConfigured ? (
        <ErrorState title="Can't verify GitHub access">
          The GitHub App isn&apos;t configured, so access to this repository can&apos;t be verified.
          Set the GitHub App env vars to view memory.
        </ErrorState>
      ) : (
        <ProjectMemory identifier={project.identifier} sp={sp} />
      )}
    </>
  );
}

async function ProjectMemory({
  identifier,
  sp,
}: {
  identifier: string;
  sp: { type?: string; q?: string; history?: string };
}) {
  const query = sp.q?.trim();
  const typeFilter = (sp.type as EntryType) || undefined;
  const history = sp.history === "1";

  let entries: MemoryEntry[] = [];
  let entriesError = false;
  try {
    if (query) {
      const { results } = await searchEntries(identifier, query, 20);
      entries = results;
    } else {
      const { entries: rows } = await listEntries(identifier, {
        type: typeFilter ? [typeFilter] : undefined,
        status: history ? ALL_STATUSES : ["active"],
        limit: 200,
      });
      entries = rows;
    }
  } catch {
    entriesError = true;
  }

  return (
    <>
      <EntryFilters />

      {entriesError ? (
        <ErrorState title="Couldn't load memory">
          The memory server returned an error for this project. If it was just off-boarded, its
          memory is no longer readable.
        </ErrorState>
      ) : entries.length === 0 ? (
        <div className="empty">
          <h3>{query ? "No matches" : "No memory yet"}</h3>
          <p>
            {query
              ? "Nothing in this project's memory matched your search."
              : "Once agents log decisions, constraints, and trade-offs against this repo, they'll appear here."}
          </p>
        </div>
      ) : query || typeFilter ? (
        <div className="stack" style={{ gap: 14 }}>
          {entries.map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </div>
      ) : (
        <GroupedEntries entries={entries} />
      )}
    </>
  );
}

function GroupedEntries({ entries }: { entries: MemoryEntry[] }) {
  return (
    <div className="stack" style={{ gap: 34 }}>
      {SECTION_ORDER.map(({ type, label }) => {
        const group = entries.filter((e) => e.type === type);
        if (group.length === 0) return null;
        return (
          <section key={type}>
            <div className="row" style={{ gap: 10, marginBottom: 14 }}>
              <h2 style={{ fontSize: 24 }}>{label}</h2>
              <span className="text-faint mono" style={{ fontSize: 13 }}>
                {group.length}
              </span>
            </div>
            <div className="stack" style={{ gap: 14 }}>
              {group.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ErrorState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
