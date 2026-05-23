"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { mintKeyAction, revokeKeyAction } from "@/app/(app)/actions";
import type { ApiKeyMeta } from "@/lib/memory";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function KeyManager({ initialKeys, email }: { initialKeys: ApiKeyMeta[]; email: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function generate() {
    setError(null);
    setFreshKey(null);
    startTransition(async () => {
      const res = await mintKeyAction(label);
      if (res.ok && res.data) {
        setFreshKey(res.data.apiKey);
        setLabel("");
        router.refresh();
      } else if (!res.ok) {
        setError(res.error);
      }
    });
  }

  function revoke(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await revokeKeyAction(id);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  async function copyKey() {
    if (!freshKey) return;
    try {
      await navigator.clipboard.writeText(freshKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  const active = initialKeys.filter((k) => !k.revokedAt);
  const revoked = initialKeys.filter((k) => k.revokedAt);

  return (
    <div className="stack" style={{ gap: 24 }}>
      {/* Generate */}
      <div className="card">
        <h3 style={{ fontSize: 18 }}>Generate a new key</h3>
        <p className="text-soft" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55 }}>
          Keys authenticate your agents to the memory server and attribute every entry to{" "}
          <span className="mono">{email}</span>. The raw key is shown once — store it now.
        </p>
        <div className="search-row" style={{ marginTop: 16 }}>
          <input
            className="input"
            placeholder="Label (e.g. laptop, CI, Cursor)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={200}
          />
          <button type="button" className="btn btn-primary" onClick={generate} disabled={pending}>
            {pending ? "Generating…" : "Generate key"}
          </button>
        </div>

        {freshKey && (
          <div style={{ marginTop: 16 }}>
            <div className="callout" style={{ marginBottom: 10 }}>
              Copy this now — you won&apos;t be able to see it again.
            </div>
            <div className="row" style={{ gap: 8 }}>
              <code className="key-value" style={{ flex: 1 }}>
                {freshKey}
              </code>
              <button type="button" className="btn btn-ghost" onClick={copyKey}>
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>
        )}
        {error && (
          <p style={{ fontSize: 12.5, marginTop: 12, color: "var(--peach-deep)" }}>
            Action failed ({error}).
          </p>
        )}
      </div>

      {/* Active keys */}
      <div className="card">
        <h3 style={{ fontSize: 18, marginBottom: 14 }}>Active keys</h3>
        {active.length === 0 ? (
          <p className="text-mute" style={{ fontSize: 14 }}>
            No active keys yet. Generate one above to connect an agent.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Created</th>
                <th>Last used</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {active.map((k) => (
                <tr key={k.id}>
                  <td style={{ color: "var(--ink)", fontWeight: 500 }}>{k.label ?? "Untitled"}</td>
                  <td>{fmt(k.createdAt)}</td>
                  <td>{fmt(k.lastUsedAt)}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => revoke(k.id)}
                      disabled={pending}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Revoked history */}
      {revoked.length > 0 && (
        <div className="card" style={{ opacity: 0.85 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Revoked</h3>
          <table className="table">
            <tbody>
              {revoked.map((k) => (
                <tr key={k.id}>
                  <td className="text-mute">{k.label ?? "Untitled"}</td>
                  <td className="text-mute">created {fmt(k.createdAt)}</td>
                  <td className="text-mute">revoked {fmt(k.revokedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
