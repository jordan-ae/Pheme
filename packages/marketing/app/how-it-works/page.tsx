import type { Metadata } from "next";
import { PageHero, PageSection } from "@/components/page-shell";
import { HiwAPI } from "@/components/interior/hiw-api";
import {
  MotifAmphora,
  MotifKey,
  MotifScroll,
  MotifPortal,
  MotifColumn,
  MotifLaurel,
  MotifStar,
} from "@/components/illustrations";
import type { ComponentType } from "react";

export const metadata: Metadata = {
  title: "How it works — Pheme",
  description: "Four small services: a memory server, an MCP wrapper, a scribe agent, and source adapters.",
};

const HIW_STEPS: { n: string; title: string; Icon: ComponentType<{ size?: number }>; tone: string; body: string; chips: string[] }[] = [
  {
    n: "01",
    title: "Memory server",
    Icon: MotifAmphora,
    tone: "tone-peach",
    body: "An Express + Postgres + pgvector REST API. Three endpoints — /log, /context, /search — and one bearer key. Run it on your own infra or use the hosted beta.",
    chips: ["Node 20+", "Drizzle ORM", "pgvector", "Supabase"],
  },
  {
    n: "02",
    title: "MCP wrapper",
    Icon: MotifKey,
    tone: "tone-lav",
    body: "A stdio MCP server that exposes four native tools to your agent: get_context, search_memory, log_entry, list_open_questions. Drop it in your IDE's MCP config once.",
    chips: ["MCP", "Claude Code", "Cursor", "Windsurf"],
  },
  {
    n: "03",
    title: "Scribe agent",
    Icon: MotifScroll,
    tone: "tone-mint",
    body: "An always-on tool-use agent. When a coding session ends, scribe reads the transcript, searches existing memory, and writes the load-bearing decisions back. Low confidence routes to a human review queue.",
    chips: ["Vercel AI SDK", "Anthropic", "OpenAI", "Stop hooks"],
  },
  {
    n: "04",
    title: "Source adapters",
    Icon: MotifPortal,
    tone: "tone-butter",
    body: "Each input — Claude Code stop hook, Cursor session end, GitHub PR comment, Slack message — is just an HTTP endpoint on the scribe service. Add a source by adding a route.",
    chips: ["Webhooks", "Slack", "GitHub Actions", "CLI"],
  },
];

const HIW_TYPES = [
  {
    name: "decision",
    color: "var(--plum)",
    bg: "color-mix(in oklab, var(--lavender) 26%, white)",
    body: "A choice the team made that the agent must respect.",
    example: "Use pgvector over a dedicated vector DB",
    rule: "ranked",
  },
  {
    name: "constraint",
    color: "#aa7530",
    bg: "color-mix(in oklab, var(--butter) 36%, white)",
    body: "A hard rule that can't be violated. Always included in /context.",
    example: "Embedding dim pinned to 1536",
    rule: "always full",
  },
  {
    name: "tradeoff",
    color: "#2f7a5e",
    bg: "color-mix(in oklab, var(--mint) 32%, white)",
    body: "An explicit decision-with-cost the agent should weigh before changing.",
    example: "HNSW chosen over IVFFlat: 2× memory, 3× recall",
    rule: "ranked",
  },
  {
    name: "question",
    color: "#a64f33",
    bg: "color-mix(in oklab, var(--peach) 30%, white)",
    body: "An open question on a branch. Surfaced by list_open_questions.",
    example: "Per-channel Slack scope, or workspace-wide?",
    rule: "by branch",
  },
];

function HiwSteps() {
  return (
    <PageSection>
      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
        <svg style={{ position: "absolute", left: 36, top: 24, width: 2, height: "calc(100% - 48px)" }} aria-hidden>
          <line x1="1" y1="0" x2="1" y2="100%" stroke="var(--line-strong)" strokeWidth="1.4" strokeDasharray="3 5" />
        </svg>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 18 }}>
          {HIW_STEPS.map(({ n, title, Icon, tone, body, chips }) => (
            <li key={n} style={{ position: "relative", paddingLeft: 92 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 8,
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  color: "var(--ink-3)",
                  boxShadow: "0 8px 24px -12px rgba(28,27,61,0.18)",
                }}
              >
                {n}
              </div>
              <div className={`card ${tone}`} style={{ padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
                  <h3 style={{ fontSize: 30, lineHeight: 1.05, margin: 0 }}>{title}</h3>
                  <Icon size={56} />
                </div>
                <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 15.5, lineHeight: 1.6, maxWidth: 620 }}>{body}</p>
                <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {chips.map((c) => (
                    <span key={c} className="mini-chip">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageSection>
  );
}

function ArchitectureDiagram() {
  return (
    <svg viewBox="0 0 920 420" width="100%" style={{ display: "block" }} fill="none">
      <g>
        <text x="20" y="32" fontFamily="ui-monospace" fontSize="11" letterSpacing="2" fill="#6e6a91">
          IDES &amp; AGENTS
        </text>
        {["Claude Code", "Cursor", "Windsurf", "Zed"].map((n, i) => (
          <g key={n} transform={`translate(20 ${56 + i * 60})`}>
            <rect width="140" height="44" rx="10" fill="#fbf6ee" stroke="#1c1b3d" strokeWidth="1.4" />
            <circle cx="18" cy="22" r="6" fill={["#c9b8f0", "#a8d6c0", "#f4b59c", "#f3d684"][i]} stroke="#1c1b3d" strokeWidth="1.2" />
            <text x="34" y="26" fontFamily="system-ui" fontSize="13" fill="#1c1b3d">
              {n}
            </text>
          </g>
        ))}
      </g>

      <g transform="translate(230 144)">
        <rect width="170" height="120" rx="14" fill="#fbf6ee" stroke="#1c1b3d" strokeWidth="1.4" />
        <text x="85" y="28" textAnchor="middle" fontFamily="ui-monospace" fontSize="10" letterSpacing="1.6" fill="#6e6a91">
          MCP WRAPPER
        </text>
        <text x="85" y="50" textAnchor="middle" fontSize="22" fill="#1c1b3d" fontStyle="italic" style={{ fontFamily: "var(--font-serif)" }}>
          stdio · http
        </text>
        {["get_context", "search_memory", "log_entry", "list_open_questions"].map((t, i) => (
          <text key={t} x="12" y={70 + i * 12} fontFamily="ui-monospace" fontSize="9.5" fill="#3a3766">
            → {t}
          </text>
        ))}
      </g>

      <g transform="translate(440 124)">
        <rect width="220" height="160" rx="16" stroke="#1c1b3d" strokeWidth="1.5" style={{ fill: "color-mix(in oklab, var(--lavender) 22%, white)" }} />
        <text x="110" y="32" textAnchor="middle" fontFamily="ui-monospace" fontSize="10" letterSpacing="1.6" fill="#6e6a91">
          MEMORY SERVER
        </text>
        <text x="110" y="62" textAnchor="middle" fontSize="28" fill="#1c1b3d" style={{ fontFamily: "var(--font-serif)" }}>
          Pheme core
        </text>
        {["POST /log", "GET /context", "GET /search"].map((rt, i) => (
          <g key={rt} transform={`translate(18 ${80 + i * 22})`}>
            <rect width="184" height="18" rx="6" fill="white" stroke="#1c1b3d" strokeWidth="1" />
            <text x="10" y="13" fontFamily="ui-monospace" fontSize="11" fill="#1c1b3d">
              {rt}
            </text>
          </g>
        ))}
      </g>

      <g transform="translate(720 156)">
        <ellipse cx="80" cy="14" rx="80" ry="14" fill="#a8d6c0" stroke="#1c1b3d" strokeWidth="1.4" />
        <path d="M0 14 V90 Q0 106 80 106 Q160 106 160 90 V14" fill="#a8d6c0" stroke="#1c1b3d" strokeWidth="1.4" />
        <ellipse cx="80" cy="14" rx="80" ry="14" fill="#fbf6ee" stroke="#1c1b3d" strokeWidth="1.4" />
        <text x="80" y="56" textAnchor="middle" fontSize="22" fill="#1c1b3d" style={{ fontFamily: "var(--font-serif)" }}>
          postgres
        </text>
        <text x="80" y="74" textAnchor="middle" fontFamily="ui-monospace" fontSize="11" fill="#3a3766">
          + pgvector
        </text>
        <text x="80" y="92" textAnchor="middle" fontFamily="ui-monospace" fontSize="10" fill="#6e6a91">
          147 entries · 9 branches
        </text>
      </g>

      <g transform="translate(60 320)">
        <rect width="200" height="80" rx="14" stroke="#1c1b3d" strokeWidth="1.4" style={{ fill: "color-mix(in oklab, var(--peach) 26%, white)" }} />
        <text x="100" y="22" textAnchor="middle" fontFamily="ui-monospace" fontSize="10" letterSpacing="1.6" fill="#6e6a91">
          SCRIBE AGENT
        </text>
        <text x="100" y="48" textAnchor="middle" fontSize="20" fill="#1c1b3d" style={{ fontFamily: "var(--font-serif)" }}>
          tool-use loop
        </text>
        <text x="100" y="68" textAnchor="middle" fontFamily="ui-monospace" fontSize="10" fill="#3a3766">
          stop hook · PR · slack · CLI
        </text>
      </g>

      <g stroke="#1c1b3d" strokeWidth="1.4" fill="none">
        <path d="M160 78 C 200 78, 200 180, 230 180" />
        <path d="M160 138 C 200 138, 200 200, 230 200" />
        <path d="M160 198 C 200 198, 200 220, 230 220" />
        <path d="M160 258 C 200 258, 200 240, 230 240" />
      </g>
      <path d="M400 204 H 440" stroke="#1c1b3d" strokeWidth="1.6" markerEnd="url(#hiw-arrow)" />
      <path d="M660 204 H 720" stroke="#1c1b3d" strokeWidth="1.6" markerEnd="url(#hiw-arrow)" />
      <path d="M720 224 H 660" stroke="#6e6a91" strokeWidth="1.2" strokeDasharray="3 4" markerEnd="url(#hiw-arrow-mute)" />
      <path d="M260 360 C 360 360, 380 300, 440 270" stroke="#e58a6e" strokeWidth="1.6" markerEnd="url(#hiw-arrow-warn)" />

      <text x="408" y="196" fontFamily="ui-monospace" fontSize="10" fill="#6e6a91">read</text>
      <text x="680" y="196" fontFamily="ui-monospace" fontSize="10" fill="#6e6a91">sql</text>
      <text x="680" y="240" fontFamily="ui-monospace" fontSize="10" fill="#6e6a91">vectors</text>
      <text x="350" y="332" fontFamily="ui-monospace" fontSize="10" fill="#a64f33">writes</text>

      <g className="twinkle" style={{ transformOrigin: "550px 80px" }}>
        <path d="M550 70 l1.4 6 l6 1.4 l-6 1.4 l-1.4 6 l-1.4 -6 l-6 -1.4 l6 -1.4 z" fill="#8f7cd4" />
      </g>

      <defs>
        <marker id="hiw-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="#1c1b3d" />
        </marker>
        <marker id="hiw-arrow-mute" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="#6e6a91" />
        </marker>
        <marker id="hiw-arrow-warn" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="#e58a6e" />
        </marker>
      </defs>
    </svg>
  );
}

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title={
          <>
            Four small services. <em>One</em> job.
          </>
        }
        sub={
          <>
            Pheme is deliberately boring. No new database. No proprietary format. A REST API, an MCP shim, and one tool-use agent —
            all composable, all self-hostable.
          </>
        }
        ornament={
          <>
            <div style={{ position: "absolute", top: 60, left: "5%", opacity: 0.85 }} className="float-soft">
              <MotifColumn size={84} />
            </div>
            <div style={{ position: "absolute", top: 110, right: "8%" }} className="float-soft-2">
              <MotifAmphora size={92} />
            </div>
            <div style={{ position: "absolute", top: 40, left: "48%" }} className="twinkle">
              <MotifStar size={20} color="#f3d684" />
            </div>
            <div style={{ position: "absolute", top: 160, right: "44%" }} className="twinkle">
              <MotifStar size={14} color="#8f7cd4" />
            </div>
          </>
        }
      />

      <HiwSteps />

      <PageSection>
        <div className="section-header" style={{ marginBottom: 32 }}>
          <span className="eyebrow">Data flow</span>
          <h2 className="section-title">
            The whole picture, <em>on one page</em>.
          </h2>
        </div>
        <div className="card" style={{ padding: 32, background: "rgba(255,255,255,0.85)" }}>
          <ArchitectureDiagram />
        </div>
      </PageSection>

      <PageSection>
        <div className="section-header" style={{ marginBottom: 32 }}>
          <span className="eyebrow">Data model</span>
          <h2 className="section-title">
            Four entry types. <em>One</em> table.
          </h2>
          <p className="section-desc">
            Every memory in Pheme is one of four kinds. The bundler treats them differently when assembling a /context response.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {HIW_TYPES.map((t) => (
            <div key={t.name} className="card" style={{ padding: 22, background: t.bg }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: t.color }}>
                  {t.name}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)" }}>{t.rule}</span>
              </div>
              <p style={{ margin: "14px 0 0", fontSize: 14, color: "var(--ink)", lineHeight: 1.5 }}>{t.body}</p>
              <div
                style={{
                  marginTop: 16,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.7)",
                  border: "1px dashed var(--line-strong)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11.5,
                  color: "var(--ink-2)",
                  lineHeight: 1.5,
                }}
              >
                &quot;{t.example}&quot;
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      <HiwAPI />

      <PageSection>
        <div className="card" style={{ padding: "48px 40px", background: "linear-gradient(160deg, color-mix(in oklab, var(--mint) 26%, white), white 70%)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: -20 }} className="float-soft" aria-hidden>
            <MotifLaurel size={140} />
          </div>
          <div style={{ maxWidth: 560, position: "relative", zIndex: 1 }}>
            <span className="eyebrow">Build with Pheme</span>
            <h2 className="section-title" style={{ textAlign: "left", marginTop: 12 }}>
              Read the <em>quickstart</em>, then ship a memory.
            </h2>
            <p className="section-desc" style={{ marginLeft: 0, textAlign: "left", marginTop: 12 }}>
              The quickstart walks you from <code className="kbd">git clone</code> to your first <code className="kbd">log_entry</code> in
              under 10 minutes.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <a href="/docs" className="btn btn-primary">
                Open quickstart →
              </a>
              <a href="/for-agents" className="btn btn-ghost">
                For agents
              </a>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}
