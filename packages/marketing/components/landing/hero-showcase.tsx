"use client";

import { useEffect, useState } from "react";

/* Editor with inline memory citations. Once mounted, the citation bullets and
   memory entries fade in one by one — feels alive without being noisy. */
export function HeroShowcase() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s < 9 ? s + 1 : s)), 280);
    return () => clearInterval(id);
  }, []);

  const bullets = [
    { key: "ad-01", tone: "decision", text: "pgvector store · AD-01", post: " — schema-compatible with the current store.", lead: "• Persist subscriptions in " },
    { key: "ad-07", tone: "decision", text: "bearer-key · AD-07", post: " pattern, not a per-channel token.", lead: "• Auth uses the shared " },
    { key: "ad-11", tone: "constraint", text: "1536-dim · AD-11", post: " — no migration.", lead: "• Embeddings stay at " },
    { key: "ad-12", tone: "constraint", text: "3k bundle cap · AD-12", post: ".", lead: "• Response payload under " },
  ] as const;
  const toneClass: Record<string, string> = {
    decision: "chip-decision",
    constraint: "chip-constraint",
    tradeoff: "chip-tradeoff",
  };

  const memoryEntries = [
    { id: "AD-01", type: "decision", title: "pgvector over a dedicated vector DB", score: 0.91, applied: true },
    { id: "AD-11", type: "constraint", title: "Embedding dim pinned to 1536", score: 0.88, applied: true },
    { id: "AD-07", type: "decision", title: "Single shared bearer key (v1)", score: 0.74, applied: true },
    { id: "AD-12", type: "constraint", title: "Bundle cap 3k · ceiling 10k", score: 0.69, applied: true },
    { id: "AD-04", type: "tradeoff", title: "HNSW vs IVFFlat (revisit Q3)", score: 0.42, applied: false },
  ];

  return (
    <div className="mock" style={{ maxWidth: 1080, margin: "0 auto" }}>
      <div className="mock-chrome">
        <span className="mock-dots">
          <span />
          <span />
          <span />
        </span>
        <span style={{ fontWeight: 500, color: "var(--ink-2)" }}>claude code · /payments/webhook.ts</span>
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <span className="pulse-soft" style={{ width: 6, height: 6, borderRadius: 999, background: "var(--mint-deep)" }} />
          pheme · on
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", minHeight: 400 }}>
        <div style={{ borderRight: "1px solid var(--line)", padding: 0 }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="mini-chip">
                <span style={{ width: 5, height: 5, borderRadius: 999, background: "#3a3766" }} />
                you
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>14:02</span>
            </div>
            <p style={{ margin: 0, fontSize: 15, color: "var(--ink)", lineHeight: 1.55 }}>
              Add a Slack webhook that hits our existing{" "}
              <code style={{ background: "rgba(28,27,61,0.06)", padding: "2px 6px", borderRadius: 5, fontSize: 12.5 }}>/notify</code> endpoint.
            </p>
          </div>

          <div style={{ padding: "16px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span
                className="mini-chip"
                style={{
                  background: "color-mix(in oklab, var(--lavender) 30%, white)",
                  color: "var(--plum)",
                  borderColor: "color-mix(in oklab, var(--lavender) 55%, white)",
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--plum)" }} />
                claude
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>
                using memory · {Math.min(step, 4)} of 4 cited
              </span>
            </div>
            <p style={{ margin: "0 0 10px", color: "var(--ink-2)", fontSize: 14.5 }}>I&apos;ll wire this through your existing patterns:</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10, fontSize: 14, lineHeight: 1.55 }}>
              {bullets.map((b, i) => (
                <li
                  key={b.key}
                  style={{
                    opacity: step > i ? 1 : 0,
                    transform: step > i ? "translateY(0)" : "translateY(6px)",
                    transition: "opacity 0.45s ease, transform 0.45s ease",
                  }}
                >
                  {b.lead}
                  <span className={`chip ${toneClass[b.tone]}`}>
                    <CitationIcon /> {b.text}
                  </span>
                  {b.post}
                </li>
              ))}
            </ul>
            {step < 4 && (
              <div style={{ display: "inline-flex", gap: 4, marginTop: 12, color: "var(--ink-4)" }}>
                <span className="pulse-soft" style={{ width: 5, height: 5, borderRadius: 999, background: "currentColor" }} />
                <span className="pulse-soft" style={{ width: 5, height: 5, borderRadius: 999, background: "currentColor", animationDelay: "0.2s" }} />
                <span className="pulse-soft" style={{ width: 5, height: 5, borderRadius: 999, background: "currentColor", animationDelay: "0.4s" }} />
              </div>
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--line)",
              padding: "10px 22px",
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              color: "var(--ink-3)",
            }}
          >
            <span>
              <span
                className="pulse-soft"
                style={{ display: "inline-block", width: 5, height: 5, borderRadius: 999, background: "var(--mint-deep)", marginRight: 6, verticalAlign: "middle" }}
              />
              consulted memory · {Math.min(step, 4)} entries · 12ms
            </span>
            <span>tokens 1,847 / 3,000</span>
          </div>
        </div>

        <div style={{ background: "linear-gradient(180deg, #fbf7ef 0%, #ffffff 100%)" }}>
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <span>Memory consulted</span>
            <span style={{ textTransform: "none" }}>/context</span>
          </div>
          <ul style={{ margin: 0, padding: 8, listStyle: "none", display: "grid", gap: 4 }}>
            {memoryEntries.map((e, i) => (
              <li
                key={e.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: e.applied ? "rgba(28,27,61,0.025)" : "transparent",
                  opacity: step > i ? (e.applied ? 1 : 0.55) : 0,
                  transform: step > i ? "translateX(0)" : "translateX(8px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
                    <span style={{ color: "var(--ink-3)" }}>{e.id}</span>
                    <span
                      style={{
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: e.type === "decision" ? "var(--plum)" : e.type === "constraint" ? "#aa7530" : "#2f7a5e",
                        fontSize: 9.5,
                      }}
                    >
                      {e.type}
                    </span>
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>{e.score.toFixed(2)}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink)", lineHeight: 1.4 }}>{e.title}</p>
                <div style={{ marginTop: 4, fontFamily: "var(--font-mono)", fontSize: 10, color: e.applied ? "#2f7a5e" : "var(--ink-4)" }}>
                  {e.applied ? "✓ applied" : "· below threshold"}
                </div>
              </li>
            ))}
          </ul>
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid var(--line)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ink-3)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{Math.min(step, 4)} applied</span>
            <span>147 in store</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CitationIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
      <path d="M5 1l1.2 2.4L9 4l-2 1.9.5 2.7L5 7.3 2.5 8.6 3 5.9 1 4l2.8-.6L5 1z" stroke="currentColor" strokeWidth="0.9" />
    </svg>
  );
}
