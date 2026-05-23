"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { enrollRepoAction, reenrollProjectAction } from "@/app/(app)/actions";

export interface RepoCardData {
  identifier: string;
  fullName: string;
  description: string | null;
  private: boolean;
  githubRepoId: string;
  githubInstallationId?: string;
  project: { id: string; active: boolean } | null;
}

export function RepoCard({ data }: { data: RepoCardData }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const status = !data.project ? "new" : data.project.active ? "enrolled" : "offboarded";

  function enroll() {
    setError(null);
    startTransition(async () => {
      const res = await enrollRepoAction({
        identifier: data.identifier,
        name: data.fullName,
        githubRepoId: data.githubRepoId,
        githubInstallationId: data.githubInstallationId,
      });
      if (!res.ok) setError(res.error);
    });
  }

  function reenroll() {
    setError(null);
    startTransition(async () => {
      const res = await reenrollProjectAction({ identifier: data.identifier, name: data.fullName });
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="card lift" style={{ display: "flex", flexDirection: "column" }}>
      <div className="project-card-top">
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: 19 }}>{data.fullName.split("/")[1]}</h3>
          <div className="repo-id" style={{ marginTop: 4 }}>
            {data.identifier}
          </div>
        </div>
        <StatusBadge status={status} isPrivate={data.private} />
      </div>

      {data.description && (
        <p className="text-soft" style={{ fontSize: 13.5, marginTop: 12, lineHeight: 1.5 }}>
          {data.description}
        </p>
      )}

      <div style={{ marginTop: "auto", paddingTop: 18, display: "flex", gap: 8 }}>
        {status === "enrolled" && data.project && (
          <Link href={`/projects/${data.project.id}`} className="btn btn-primary btn-sm">
            View memory
          </Link>
        )}
        {status === "new" && (
          <button type="button" className="btn btn-primary btn-sm" onClick={enroll} disabled={pending}>
            {pending ? "Enrolling…" : "Enroll project"}
          </button>
        )}
        {status === "offboarded" && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={reenroll} disabled={pending}>
            {pending ? "Re-enrolling…" : "Re-enroll"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-mute" style={{ fontSize: 12, marginTop: 10, color: "var(--peach-deep)" }}>
          {error === "no_access"
            ? "You no longer have GitHub access to this repo."
            : `Action failed (${error}).`}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status, isPrivate }: { status: string; isPrivate: boolean }) {
  if (status === "enrolled") {
    return (
      <span className="badge badge-enrolled">
        <span className="badge-dot" /> Enrolled
      </span>
    );
  }
  if (status === "offboarded") {
    return (
      <span className="badge badge-offboarded">
        <span className="badge-dot" /> Off-boarded
      </span>
    );
  }
  return (
    <span className="badge">
      <span className="badge-dot" /> {isPrivate ? "Private" : "Public"}
    </span>
  );
}
