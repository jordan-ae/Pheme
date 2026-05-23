"use client";

import { useState, type CSSProperties } from "react";

type State = "idle" | "loading" | "success" | "error";

export function WaitlistForm({
  source = "home",
  buttonLabel = "Request access",
  placeholder = "you@startup.dev",
  style,
}: {
  source?: string;
  buttonLabel?: string;
  placeholder?: string;
  style?: CSSProperties;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Something went wrong.");
      setState("success");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "success") {
    return (
      <div
        className="card"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 18px",
          borderRadius: 999,
          width: "100%",
          maxWidth: 420,
          ...style,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: 999,
            background: "var(--accent-soft)",
            color: "var(--accent)",
            flex: "0 0 auto",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 7.5L6 11L12 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span style={{ fontSize: 13.5, color: "var(--ink)" }}>
          You&apos;re on the list — we&apos;ll email{" "}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{email}</span>.
        </span>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 420, ...style }}>
      <form className="waitlist" onSubmit={onSubmit} style={{ maxWidth: "100%" }}>
        <input
          type="email"
          required
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading"}
        />
        <button type="submit" className="btn btn-primary" disabled={state === "loading"}>
          {state === "loading" ? "Joining…" : buttonLabel}
        </button>
      </form>
      {error && state === "error" && (
        <p style={{ marginTop: 8, fontSize: 12, color: "#c0492f" }}>{error}</p>
      )}
    </div>
  );
}
