import { MotifScroll, MotifPortal, MotifLaurel } from "@/components/illustrations";
import type { ComponentType } from "react";

type Step = {
  n: string;
  title: string;
  Icon: ComponentType<{ size?: number }>;
  tone: string;
  desc: string;
  meta: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Capture",
    Icon: MotifScroll,
    tone: "tone-peach",
    desc: "When a session ends, the Scribe agent reads the transcript and writes load-bearing decisions back to memory. Low confidence? Flagged for review.",
    meta: "Claude Code · Cursor · Windsurf · PR comments",
  },
  {
    n: "02",
    title: "Recall",
    Icon: MotifPortal,
    tone: "tone-lav",
    desc: "Every agent in your project reads the same store. Semantic search returns the entries that bear on the task — never more than the bundle budget allows.",
    meta: "pgvector · 1536-dim · BM25 hybrid",
  },
  {
    n: "03",
    title: "Apply",
    Icon: MotifLaurel,
    tone: "tone-mint",
    desc: "Memories arrive inline as citations. The agent's response cites which constraints applied and which were below threshold. You see why, every time.",
    meta: "Inline chips · audit trail · supersede chain",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">How it works</span>
          <h2 className="section-title">
            Three motions. <em>One</em> continuous mind.
          </h2>
          <p className="section-desc">
            Pheme runs as a sidecar to your agent. Nothing to integrate beyond a key and a stop hook. Memories accumulate,
            supersede, and travel with the repo.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, position: "relative" }}>
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: 220, top: 60, zIndex: 0, pointerEvents: "none" }}
            viewBox="0 0 1000 220"
            preserveAspectRatio="none"
          >
            <path d="M120 60 Q300 -20 500 60 Q700 140 880 60" stroke="var(--accent)" strokeWidth="1.4" fill="none" strokeDasharray="3 7" opacity="0.4" />
          </svg>

          {STEPS.map((s) => {
            const Icon = s.Icon;
            return (
              <div key={s.n} className={`card ${s.tone}`} style={{ padding: 28, position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-3)" }}>{s.n}</span>
                  <Icon size={64} />
                </div>
                <h3 style={{ fontSize: 32, lineHeight: 1, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.55 }}>{s.desc}</p>
                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: "1px dashed var(--line-strong)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ink-3)",
                  }}
                >
                  {s.meta}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
