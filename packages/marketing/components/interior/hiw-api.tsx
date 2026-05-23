"use client";

import { useState } from "react";

const HIW_ROUTES = [
  {
    method: "POST",
    path: "/log",
    body: "Create a new active entry. Deduped on sha256(title+body). 409 on collision.",
    sample: `curl -X POST $BASE/log \\
  -H "authorization: bearer phm_live_..." \\
  -d '{
    "type": "decision",
    "title": "pgvector store over a dedicated vector DB",
    "body": "Keep the stack Postgres-only. ..."
  }'`,
  },
  {
    method: "GET",
    path: "/context",
    body: "Right-sized bundle for a branch. Filters by files, types, and a token budget you control.",
    sample: `curl "$BASE/context?branch=feature/queue&budget=3000" \\
  -H "authorization: bearer phm_live_..."

# returns
# { entries: [...], applied: 4, dropped: 1, tokens: 1847 }`,
  },
  {
    method: "GET",
    path: "/search",
    body: "pgvector cosine similarity over active entries. Ranked, with similarity scores.",
    sample: `curl "$BASE/search?q=embedding+dim" \\
  -H "authorization: bearer phm_live_..."

# returns top-k with scores`,
  },
];

export function HiwAPI() {
  const [active, setActive] = useState(0);
  const r = HIW_ROUTES[active];
  return (
    <section className="section" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: 32 }}>
          <span className="eyebrow">API surface</span>
          <h2 className="section-title">
            Three endpoints. <em>That&apos;s the whole API.</em>
          </h2>
        </div>
        <div className="mock" style={{ background: "rgba(255,255,255,0.96)" }}>
          <div className="mock-chrome">
            <span className="mock-dots">
              <span />
              <span />
              <span />
            </span>
            <span>memory · api</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>v0.4.2</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr" }}>
            <ul style={{ margin: 0, padding: 14, listStyle: "none", borderRight: "1px solid var(--line)", display: "grid", gap: 8 }}>
              {HIW_ROUTES.map((rt, i) => (
                <li key={rt.path}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: i === active ? "var(--accent-soft)" : "transparent",
                      border: i === active ? "1px solid color-mix(in oklab, var(--accent) 30%, white)" : "1px solid transparent",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12.5,
                      color: i === active ? "var(--ink)" : "var(--ink-2)",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ color: rt.method === "GET" ? "#2f7a5e" : "var(--plum)" }}>{rt.method}</span> {rt.path}
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ padding: 22, minHeight: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background:
                      r.method === "GET" ? "color-mix(in oklab, var(--mint) 38%, white)" : "color-mix(in oklab, var(--lavender) 36%, white)",
                    color: r.method === "GET" ? "#2f7a5e" : "var(--plum)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {r.method}
                </span>
                <code style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--ink)" }}>{r.path}</code>
              </div>
              <p style={{ margin: "10px 0 16px", color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.55 }}>{r.body}</p>
              <pre
                style={{
                  margin: 0,
                  padding: 16,
                  borderRadius: 12,
                  background: "#1c1b3d",
                  color: "#fbf6ee",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12.5,
                  lineHeight: 1.65,
                  overflowX: "auto",
                }}
              >
                {r.sample}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
