import { MotifAmphora, MotifScroll, MotifMap, MotifKey, MotifBranches } from "@/components/illustrations";

export function Features() {
  return (
    <section id="features" className="section">
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">The memory layer</span>
          <h2 className="section-title">
            Six pieces. <em>One</em> mind that ships with the repo.
          </h2>
          <p className="section-desc">
            Every feature exists to keep your agent&apos;s working knowledge in sync with reality — without becoming another thing
            you have to maintain.
          </p>
        </div>

        <FeaturePersistent />
        <div className="divider-dashed" />
        <FeatureScribe />
        <div className="divider-dashed" />
        <FeatureSearch />
        <div className="divider-dashed" />
        <FeatureMultiIDE />
        <div className="divider-dashed" />
        <FeatureBranches />
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
      <span style={{ color: "var(--ink-3)" }}>{k}</span>
      <span style={{ color: "var(--ink)" }}>{v}</span>
    </div>
  );
}

const SESSIONS = [
  { when: "today, 14:02", agent: "claude", task: "refactor /auth middleware", r: "6r", w: "2w", st: "ok" },
  { when: "today, 11:48", agent: "cursor", task: "ui tweak — search dropdown", r: "3r", w: "0w", st: "ok" },
  { when: "yesterday", agent: "windsurf", task: "perf pass on /context", r: "9r", w: "1w", st: "ok" },
  { when: "yesterday", agent: "claude", task: "scribe-agent rate limit", r: "4r", w: "1w", st: "ok" },
  { when: "mon", agent: "cursor", task: "draft: queue retries", r: "2r", w: "0w", st: "pending" },
];

function FeaturePersistent() {
  return (
    <div className="feature-row reveal">
      <div className="feature-text">
        <div style={{ marginBottom: 16 }}>
          <MotifAmphora size={56} />
        </div>
        <span className="eyebrow">Persistent memory</span>
        <h3 className="feature-text-title">
          Context that <em style={{ color: "var(--accent)" }}>outlives</em> the session.
        </h3>
        <p className="feature-text-desc">
          Transcripts get compacted. Branches get archived. New agents get spun up. Pheme keeps the load-bearing decisions where
          they belong — attached to the project, not the conversation.
        </p>
        <ul className="feature-bullets">
          <li>One store, every agent. No copy-paste tax.</li>
          <li>Decisions, constraints, and tradeoffs as first-class types.</li>
          <li>Fully managed — no database or infra to run.</li>
        </ul>
      </div>
      <div className="feature-visual">
        <div className="mock">
          <div className="mock-chrome">
            <span className="mock-dots">
              <span />
              <span />
              <span />
            </span>
            <span>memory · activity · last 7 days</span>
            <span />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", minHeight: 320 }}>
            <div style={{ borderRight: "1px solid var(--line)", padding: 18, display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4)" }}>
                Project store
              </div>
              <div className="card-mute" style={{ marginTop: 12, padding: 14, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                <Row k="entries" v="147" />
                <Row k="branches" v="9" />
                <Row k="last write" v="2m ago" />
              </div>
              <div style={{ marginTop: "auto", fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ink-4)", lineHeight: 1.5 }}>
                One store. Every session
                <br />
                reads + writes from the
                <br />
                same source.
              </div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 8 }}>
                Sessions
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
                {SESSIONS.map((s) => (
                  <li
                    key={s.task}
                    style={{ display: "grid", gridTemplateColumns: "100px 90px 1fr 90px", alignItems: "center", padding: "8px 8px", borderRadius: 8, fontSize: 12.5 }}
                  >
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{s.when}</span>
                    <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-2)" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.st === "ok" ? "var(--mint-deep)" : "#d6a374" }} />
                      {s.agent}
                    </span>
                    <span style={{ color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.task}</span>
                    <span style={{ display: "inline-flex", justifyContent: "flex-end", gap: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
                      <span>{s.r}</span>
                      <span style={{ color: "var(--plum)" }}>{s.w}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: "1px solid var(--line)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--accent)" }} />5 sessions · 3 agents · one continuous memory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ScribeLine = {
  t: string;
  kind: "log" | "tool" | "entry";
  text?: string;
  tone?: string;
  name?: string;
  args?: string;
  entryType?: string;
  title?: string;
};

const SCRIPT: ScribeLine[] = [
  { t: "00.12", kind: "log", text: "stop hook · claude session ended", tone: "mute" },
  { t: "00.14", kind: "log", text: "ingesting 14.2 KB transcript", tone: "mute" },
  { t: "00.41", kind: "tool", name: "search_memory", args: '"bundle token estimation"' },
  { t: "00.62", kind: "log", text: "2 candidates · best 0.81", tone: "mute" },
  { t: "00.78", kind: "tool", name: "log_entry", args: '{ type: "decision", … }' },
  { t: "00.91", kind: "entry", entryType: "decision", title: "Bundle estimate uses chars/4 heuristic" },
  { t: "01.20", kind: "tool", name: "flag_for_review", args: '"GitHub source spec"' },
  { t: "01.34", kind: "log", text: "done · 1 logged · 1 review", tone: "ok" },
];

function FeatureScribe() {
  return (
    <div className="feature-row reverse reveal">
      <div className="feature-text">
        <div style={{ marginBottom: 16 }}>
          <MotifScroll size={56} />
        </div>
        <span className="eyebrow">Scribe agent</span>
        <h3 className="feature-text-title">
          Decisions <em style={{ color: "var(--accent)" }}>log themselves.</em>
        </h3>
        <p className="feature-text-desc">
          A small, always-on tool-use agent. When a session ends — a Claude Code stop hook, a PR comment, a Slack message — it reads
          the transcript and writes the load-bearing decisions back to memory.
        </p>
        <ul className="feature-bullets">
          <li>
            Tool-use loop with <span className="kbd">search_memory</span> + <span className="kbd">log_entry</span>.
          </li>
          <li>Low confidence → flagged, not logged. Humans confirm.</li>
          <li>Triggers: stop-hook, PR comment, Slack /pheme, CLI.</li>
        </ul>
      </div>
      <div className="feature-visual">
        <div className="mock">
          <div className="mock-chrome">
            <span className="mock-dots">
              <span />
              <span />
              <span />
            </span>
            <span>scribe-agent · port 5000 · running</span>
            <span />
          </div>
          <div style={{ padding: 18, fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7, minHeight: 320 }}>
            {SCRIPT.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ color: "var(--ink-4)", width: 36, flexShrink: 0 }}>{l.t}</span>
                {l.kind === "log" && <span style={{ color: l.tone === "ok" ? "#2f7a5e" : "var(--ink-3)" }}>{l.text}</span>}
                {l.kind === "tool" && (
                  <span style={{ color: "var(--plum)" }}>
                    → {l.name}
                    <span style={{ color: "var(--ink-2)" }}> ({l.args})</span>
                  </span>
                )}
                {l.kind === "entry" && (
                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: "color-mix(in oklab, var(--lavender) 30%, white)",
                      border: "1px solid color-mix(in oklab, var(--lavender) 55%, white)",
                      flex: 1,
                      margin: "2px 0",
                    }}
                  >
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--plum)" }}>✓ logged · {l.entryType}</div>
                    <div style={{ fontFamily: "var(--font-sans)", color: "var(--ink)", marginTop: 2 }}>{l.title}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {([["search", 1], ["logged", 1], ["review", 1]] as const).map(([l, n]) => (
              <div
                key={l}
                style={{ padding: "10px 16px", borderRight: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11.5 }}
              >
                <span style={{ color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{l}</span>
                <span>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const RESULTS = [
  { id: "AD-11", type: "constraint", title: "Embedding dim pinned to 1536 (OpenAI compat)", score: 0.94, why: "Set in v0.2 to avoid migration risk on existing 14k vectors." },
  { id: "AD-04", type: "tradeoff", title: "HNSW vs IVFFlat", score: 0.81, why: "Picked HNSW; revisit at >50k vectors." },
  { id: "AD-01", type: "decision", title: "pgvector store over a dedicated vector DB", score: 0.77, why: "Postgres-first stack; no new infra surface." },
];

function FeatureSearch() {
  return (
    <div className="feature-row reveal">
      <div className="feature-text">
        <div style={{ marginBottom: 16 }}>
          <MotifMap size={64} />
        </div>
        <span className="eyebrow">Semantic search</span>
        <h3 className="feature-text-title">
          Find memories before <em style={{ color: "var(--accent)" }}>you forget</em> them.
        </h3>
        <p className="feature-text-desc">
          Vector + BM25 hybrid retrieval, capped by a token budget you set. Pheme returns the entries that bear on the current task —
          and tells the agent which dimensions made the cut.
        </p>
        <ul className="feature-bullets">
          <li>Hybrid pgvector + BM25, default top-k = 6.</li>
          <li>Bundle budget configurable per agent (1k → 10k).</li>
          <li>Returns scores, types, and supersedes chain.</li>
        </ul>
      </div>
      <div className="feature-visual">
        <div className="mock">
          <div className="mock-chrome">
            <span className="mock-dots">
              <span />
              <span />
              <span />
            </span>
            <span>memory · search</span>
            <span />
          </div>
          <div style={{ padding: 18 }}>
            <div className="card-mute" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9 9l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span style={{ color: "var(--ink)" }}>why is the embedding dim pinned to 1536?</span>
            </div>
            <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
              {RESULTS.map((r) => (
                <li key={r.id} style={{ padding: 12, border: "1px solid var(--line)", borderRadius: 12, background: "rgba(255,255,255,0.7)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
                      <span>{r.id}</span>
                      <span
                        style={{
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontSize: 9.5,
                          color: r.type === "decision" ? "var(--plum)" : r.type === "constraint" ? "#aa7530" : "#2f7a5e",
                        }}
                      >
                        {r.type}
                      </span>
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{r.score.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--ink)" }}>{r.title}</div>
                  <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>{r.why}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const CLIENTS = [
  { name: "Claude Code", meta: "stdio · stop hook", seat: "active", acc: "var(--plum)" },
  { name: "Cursor", meta: "http · /context", seat: "active", acc: "#2f7a5e" },
  { name: "Windsurf", meta: "http · /context", seat: "active", acc: "#aa7530" },
  { name: "Zed", meta: "MCP stdio", seat: "active", acc: "#7a64c0" },
  { name: "your CLI", meta: "openapi · bearer", seat: "open", acc: "var(--ink-3)" },
  { name: "PR bot", meta: "github actions", seat: "open", acc: "var(--ink-3)" },
];

function FeatureMultiIDE() {
  return (
    <div className="feature-row reverse reveal">
      <div className="feature-text">
        <div style={{ marginBottom: 16 }}>
          <MotifKey size={64} />
        </div>
        <span className="eyebrow">Multi-IDE</span>
        <h3 className="feature-text-title">
          One key. <em style={{ color: "var(--accent)" }}>Every</em> agent.
        </h3>
        <p className="feature-text-desc">
          Pheme is just an MCP server. Drop the key into Claude Code, Cursor, Windsurf, or your own loop. The same memory store. No
          favorites.
        </p>
        <ul className="feature-bullets">
          <li>
            MCP <span className="kbd">stdio</span> + <span className="kbd">http</span> transports.
          </li>
          <li>OpenAPI for non-MCP loops.</li>
          <li>Per-user keys, project-scoped tokens.</li>
        </ul>
      </div>
      <div className="feature-visual">
        <div className="card tone-sky" style={{ padding: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {CLIENTS.map((c) => (
              <div key={c.name} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.85)", border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      padding: "2px 7px",
                      borderRadius: 999,
                      background: c.seat === "active" ? "color-mix(in oklab, var(--mint) 40%, white)" : "rgba(28,27,61,0.06)",
                      color: c.seat === "active" ? "#2f7a5e" : "var(--ink-3)",
                    }}
                  >
                    {c.seat}
                  </span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{c.meta}</div>
                <div style={{ marginTop: 10, height: 4, background: "rgba(28,27,61,0.05)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: c.seat === "active" ? "100%" : "0%", background: c.acc }} />
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: "1px dashed var(--line-strong)",
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              color: "var(--ink-3)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>4 active · 2 open seats</span>
            <span>same store · all reads/writes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureBranches() {
  return (
    <div className="feature-row reveal">
      <div className="feature-text">
        <div style={{ marginBottom: 16 }}>
          <MotifBranches size={64} />
        </div>
        <span className="eyebrow">Branch-aware</span>
        <h3 className="feature-text-title">
          Memory that <em style={{ color: "var(--accent)" }}>follows</em> git.
        </h3>
        <p className="feature-text-desc">
          Decisions are tied to branches. A new entry on <span className="kbd">feature/queue</span> isn&apos;t visible from{" "}
          <span className="kbd">main</span> until the PR lands. Pheme replays the supersede chain on merge.
        </p>
        <ul className="feature-bullets">
          <li>Branch-scoped writes; main-scoped reads on demand.</li>
          <li>Supersede chain auto-resolves on merge.</li>
          <li>Conflicts surfaced in PR as memory diff.</li>
        </ul>
      </div>
      <div className="feature-visual">
        <div className="mock">
          <div className="mock-chrome">
            <span className="mock-dots">
              <span />
              <span />
              <span />
            </span>
            <span>memory · branch graph</span>
            <span />
          </div>
          <div style={{ padding: 24, minHeight: 320 }}>
            <BranchGraph />
          </div>
        </div>
      </div>
    </div>
  );
}

function BranchGraph() {
  const nodes = [
    { id: "main-1", x: 30, y: 60, label: "AD-01", color: "#f4b59c", muted: false },
    { id: "main-2", x: 130, y: 60, label: "AD-07", color: "#f4b59c", muted: false },
    { id: "main-3", x: 230, y: 60, label: "AD-11", color: "#f4b59c", muted: false },
    { id: "f-1", x: 180, y: 130, label: "AD-09", color: "#c9b8f0", muted: false },
    { id: "f-2", x: 280, y: 130, label: "AD-12", color: "#c9b8f0", muted: false },
    { id: "h-1", x: 230, y: 200, label: "AD-13", color: "#a8d6c0", muted: false },
    { id: "main-4", x: 330, y: 60, label: "(now)", color: "#fbf6ee", muted: true },
  ];
  const lines = [
    "M30 60 H330",
    "M130 60 C 150 80, 160 110, 180 130",
    "M180 130 H 280",
    "M280 130 C 300 150, 310 180, 230 200",
  ];

  return (
    <svg viewBox="0 0 400 240" width="100%" height="100%" fill="none">
      {lines.map((d, i) => (
        <path key={i} d={d} stroke="var(--ink-3)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeDasharray={i > 0 ? "3 4" : ""} />
      ))}
      <text x="6" y="36" fontFamily="ui-monospace" fontSize="10" fill="var(--ink-3)">main</text>
      <text x="146" y="118" fontFamily="ui-monospace" fontSize="10" fill="var(--plum)">feature/queue</text>
      <text x="200" y="226" fontFamily="ui-monospace" fontSize="10" fill="#2f7a5e">hotfix/auth</text>

      {nodes.map((n) => (
        <g key={n.id} opacity={n.muted ? 0.5 : 1}>
          <circle cx={n.x} cy={n.y} r="13" fill={n.color} stroke="#1c1b3d" strokeWidth="1.4" />
          <text x={n.x} y={n.y + 3.5} textAnchor="middle" fontFamily="ui-monospace" fontSize="8.5" fill="#1c1b3d">
            {n.label}
          </text>
        </g>
      ))}
      <path d="M130 75 Q150 95 175 122" stroke="#e58a6e" strokeWidth="1.4" fill="none" strokeDasharray="2 3" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6 z" fill="#e58a6e" />
        </marker>
      </defs>
      <text x="80" y="105" fontFamily="ui-monospace" fontSize="9" fill="#e58a6e">supersedes →</text>
    </svg>
  );
}
