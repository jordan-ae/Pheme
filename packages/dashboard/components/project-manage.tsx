"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { offboardProjectAction, reenrollProjectAction } from "@/app/(app)/actions";

export function ProjectManage({
  projectId,
  identifier,
  name,
  active,
}: {
  projectId: string;
  identifier: string;
  name: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const shortName = (name || identifier).split("/").pop() ?? identifier;
  const armed = confirmText.trim() === shortName;

  function offboard() {
    setError(null);
    startTransition(async () => {
      const res = await offboardProjectAction({ projectId, identifier });
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function reenroll() {
    setError(null);
    startTransition(async () => {
      const res = await reenrollProjectAction({ identifier, name });
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  if (!active) {
    return (
      <div className="card" style={{ maxWidth: 620, borderColor: "var(--line)" }}>
        <h3 style={{ fontSize: 19 }}>Re-enroll this project</h3>
        <p className="text-soft" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55 }}>
          Reactivate <span className="mono">{identifier}</span>. Memory collection resumes and its
          existing entries become readable again — nothing was deleted.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={reenroll}
          disabled={pending}
        >
          {pending ? "Re-enrolling…" : "Re-enroll project"}
        </button>
        {error && <ErrorLine error={error} />}
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{ maxWidth: 620, borderColor: "color-mix(in oklab, var(--peach-deep) 40%, var(--line))" }}
    >
      <span className="eyebrow" style={{ color: "var(--peach-deep)" }}>
        Danger zone
      </span>
      <h3 style={{ fontSize: 19, marginTop: 10 }}>Off-board this project</h3>
      <p className="text-soft" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55 }}>
        Off-boarding stops all memory collection and freezes existing entries out of agent context —
        agents querying this repo will be rejected. Nothing is deleted; you can re-enroll any time to
        restore access.
      </p>

      <label className="text-mute" style={{ display: "block", marginTop: 18, fontSize: 13 }}>
        Type <strong style={{ color: "var(--ink)" }}>{shortName}</strong> to confirm:
      </label>
      <input
        className="input"
        style={{ marginTop: 8 }}
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={shortName}
        autoComplete="off"
      />

      <button
        type="button"
        className="btn btn-danger"
        style={{ marginTop: 16 }}
        onClick={offboard}
        disabled={!armed || pending}
      >
        {pending ? "Off-boarding…" : "Off-board project"}
      </button>
      {error && <ErrorLine error={error} />}
    </div>
  );
}

function ErrorLine({ error }: { error: string }) {
  return (
    <p style={{ fontSize: 12.5, marginTop: 12, color: "var(--peach-deep)" }}>
      {error === "no_access"
        ? "You no longer have GitHub access to this repo."
        : `Action failed (${error}).`}
    </p>
  );
}
