import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { PageHero, PageSection } from "@/components/page-shell";
import { MotifKey, MotifDove, MotifStar } from "@/components/illustrations";
import { ToolLogo, hasToolLogo } from "@/components/landing/tool-logos";

export const metadata: Metadata = {
  title: "For agents — Pheme",
  description: "Setup recipes for Claude Code, Cursor, Windsurf, and Codex CLI. MCP-native where supported, REST where not.",
};

const AGENTS = [
  {
    id: "claude-code",
    name: "Claude Code",
    slug: "claude",
    color: "#D97757",
    tone: "tone-peach",
    blurb:
      "Native MCP support and Stop hooks. The full loop — read memory, write memory, scribe on session end — works out of the box.",
    config: {
      label: "~/.claude/settings.json",
      lang: "json",
      code: `{
  "mcpServers": {
    "phemesh-memory": {
      "command": "npx",
      "args": ["-y", "@phemesh/memory-mcp"],
      "env": {
        "MEMORY_SERVER_URL": "https://pheme-ztma.onrender.com",
        "MEMORY_API_KEY": "phm_live_..."
      }
    }
  },
  "hooks": {
    "Stop": [
      { "command": "curl -X POST $SCRIBE_URL/events/claude-stop -d @-" }
    ]
  }
}`,
    },
    steps: [
      "Grab your workspace API key from Pheme",
      "Add the MCP snippet above to your settings.json",
      "Restart Claude Code — the four tools appear",
      "Optional: drop CLAUDE.md in (Docs → Templates)",
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    slug: "cursor",
    color: "#1c1b3d",
    tone: "tone-lav",
    blurb:
      "MCP support landed in Cursor 0.45+. Drop the same MCP entry into Cursor's settings and the tools light up across all your workspaces.",
    config: {
      label: ".cursor/mcp.json",
      lang: "json",
      code: `{
  "mcpServers": {
    "phemesh-memory": {
      "command": "npx",
      "args": ["-y", "@phemesh/memory-mcp"],
      "env": {
        "MEMORY_SERVER_URL": "https://pheme-ztma.onrender.com",
        "MEMORY_API_KEY": "phm_live_..."
      }
    }
  }
}`,
    },
    steps: [
      "Enable MCP in Cursor → Settings → Features",
      "Drop a .cursor/mcp.json in any project root",
      "Reload — Cursor exposes the tools to the agent",
      "Add .cursorrules (Docs → Templates)",
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    slug: "windsurf",
    color: "#19A974",
    tone: "tone-mint",
    blurb: "Windsurf's Cascade agent picks up MCP servers from the global config. Same shim, same four tools, same memory.",
    config: {
      label: "~/.codeium/windsurf/mcp_config.json",
      lang: "json",
      code: `{
  "mcpServers": {
    "phemesh-memory": {
      "command": "npx",
      "args": ["-y", "@phemesh/memory-mcp"],
      "env": {
        "MEMORY_SERVER_URL": "https://pheme-ztma.onrender.com",
        "MEMORY_API_KEY": "phm_live_..."
      }
    }
  }
}`,
    },
    steps: [
      "Open Windsurf → Settings → Cascade → MCP",
      "Paste the snippet above",
      "Restart Cascade",
      "Add .windsurfrules (Docs → Templates)",
    ],
  },
  {
    id: "codex",
    name: "Codex CLI",
    slug: "codex",
    color: "#10A37F",
    tone: "tone-butter",
    blurb:
      "No native MCP yet — Pheme ships a thin REST client you can shell out to. Codex calls /context at task start; the scribe webhook closes the loop.",
    config: {
      label: "~/.codex/tools/pheme.sh",
      lang: "bash",
      code: `#!/usr/bin/env bash
# Codex tool wrapper — pheme memory
case "$1" in
  context)
    curl -sS -H "Authorization: Bearer $MEMORY_API_KEY" \\
      "$MEMORY_SERVER_URL/context?branch=$(git branch --show-current)"
    ;;
  search)
    curl -sS -H "Authorization: Bearer $MEMORY_API_KEY" \\
      "$MEMORY_SERVER_URL/search?q=$(jq -sRr @uri <<<"$2")"
    ;;
esac`,
    },
    steps: [
      "Drop the script in your tools dir",
      "Export MEMORY_SERVER_URL and MEMORY_API_KEY",
      "Hook your post-session bash to POST /events/codex-end",
      "Done — Codex now has memory between runs",
    ],
  },
];

const TEMPLATES = [
  { f: "CLAUDE.md", for: "Claude Code", slug: "claude", color: "#f4b59c" },
  { f: ".cursorrules", for: "Cursor", slug: "cursor", color: "#c9b8f0" },
  { f: ".windsurfrules", for: "Windsurf", slug: "windsurf", color: "#a8d6c0" },
  { f: ".github/copilot-instructions.md", for: "Copilot", slug: "copilot", color: "#f3d684" },
  { f: "AGENT.md", for: "Zed agent", slug: "zed", color: "#b9d1ea" },
  { f: "AGENTS.md", for: "OpenCode", slug: "opencode", color: "#f6c4c4" },
];

const th: CSSProperties = {
  padding: "14px 18px",
  textAlign: "left",
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
  background: "rgba(255,255,255,0.5)",
};
const td: CSSProperties = { padding: "12px 18px", color: "var(--ink)", verticalAlign: "middle" };

function AgentBadge({ name, slug, color }: { name: string; slug: string; color: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 0 rgba(28,27,61,0.12), 0 8px 16px -10px rgba(28,27,61,0.3)",
          border: "1px solid var(--line)",
        }}
      >
        <ToolLogo slug={slug} size={24} />
      </div>
      <h3 style={{ fontSize: 32, margin: 0, lineHeight: 1.05 }}>{name}</h3>
    </div>
  );
}

function CodeBlock({ label, code, lang }: { label: string; code: string; lang: string }) {
  return (
    <div className="mock" style={{ background: "#1c1b3d", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "linear-gradient(180deg, #2a274f, #1c1b3d)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "rgba(251,246,238,0.7)",
        }}
      >
        <span>{label}</span>
        <span style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 10, opacity: 0.6 }}>{lang}</span>
      </div>
      <pre style={{ margin: 0, padding: "18px 22px", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "#fbf6ee", lineHeight: 1.65, overflowX: "auto" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function AgentRecipe({ a }: { a: (typeof AGENTS)[number] }) {
  return (
    <section id={a.id} style={{ scrollMarginTop: 120, padding: "32px 0" }}>
      <div className={`card ${a.tone}`} style={{ padding: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 36, alignItems: "flex-start" }}>
          <div>
            <AgentBadge name={a.name} slug={a.slug} color={a.color} />
            <p style={{ marginTop: 18, color: "var(--ink-2)", fontSize: 15.5, lineHeight: 1.6, maxWidth: 460 }}>{a.blurb}</p>
            <ol style={{ margin: "22px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
              {a.steps.map((step, i) => (
                <li key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 12, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <CodeBlock label={a.config.label} code={a.config.code} lang={a.config.lang} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ForAgentsMatrix() {
  const tools = ["get_context", "search_memory", "log_entry", "list_open_questions"];
  const rows = [
    { agent: "Claude Code", slug: "claude", transport: "MCP · stdio", values: [true, true, true, true] },
    { agent: "Cursor", slug: "cursor", transport: "MCP · stdio", values: [true, true, true, true] },
    { agent: "Windsurf · Cascade", slug: "windsurf", transport: "MCP · stdio", values: [true, true, true, true] },
    { agent: "Zed · agent", slug: "zed", transport: "MCP · stdio", values: [true, true, true, false] },
    { agent: "Codex CLI", slug: "codex", transport: "REST · bash", values: [true, true, true, false] },
    { agent: "Aider", slug: "aider", transport: "REST", values: [true, true, true, false] },
    { agent: "Continue", slug: "continue", transport: "REST", values: [true, true, false, false] },
  ];
  return (
    <PageSection>
      <div className="section-header" style={{ marginBottom: 28 }}>
        <span className="eyebrow">Coverage matrix</span>
        <h2 className="section-title">
          Same tools. <em>Every</em> seat.
        </h2>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th style={th}>Agent</th>
              <th style={th}>Transport</th>
              {tools.map((t) => (
                <th key={t} style={{ ...th, fontFamily: "var(--font-mono)", fontSize: 11.5, textAlign: "center" }}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.agent} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={td}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    {hasToolLogo(r.slug) ? (
                      <ToolLogo slug={r.slug} size={16} />
                    ) : (
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--ink-3)", opacity: 0.45 }} />
                    )}
                    {r.agent}
                  </span>
                </td>
                <td style={{ ...td, color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{r.transport}</td>
                {r.values.map((v, vi) => (
                  <td key={vi} style={{ ...td, textAlign: "center" }}>
                    {v ? (
                      <span style={{ display: "inline-block", width: 20, height: 20, borderRadius: 999, background: "color-mix(in oklab, var(--mint) 40%, white)", color: "#2f7a5e", lineHeight: "20px", fontSize: 12, fontWeight: 700 }}>
                        ✓
                      </span>
                    ) : (
                      <span style={{ display: "inline-block", width: 20, height: 20, borderRadius: 999, background: "rgba(28,27,61,0.06)", color: "var(--ink-4)", lineHeight: "20px", fontSize: 12 }}>·</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  );
}

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="For every agent"
        title={
          <>
            One memory. <em>Every</em> coding agent.
          </>
        }
        sub={
          <>
            MCP-native where it&apos;s supported. A thin REST shim where it&apos;s not. The four tools — read, search, log, list-open —
            show up consistently no matter where your agent is running.
          </>
        }
        ornament={
          <>
            <div style={{ position: "absolute", top: 80, left: "6%" }} className="float-soft">
              <MotifKey size={88} />
            </div>
            <div style={{ position: "absolute", top: 50, right: "5%" }} className="float-soft-2">
              <MotifDove size={92} />
            </div>
            <div style={{ position: "absolute", top: 24, left: "44%" }} className="twinkle">
              <MotifStar size={18} color="#e58a6e" />
            </div>
          </>
        }
      />

      <div style={{ position: "sticky", top: 80, zIndex: 5, display: "flex", justifyContent: "center", padding: "12px 0" }}>
        <div
          style={{
            display: "inline-flex",
            gap: 8,
            padding: 6,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            border: "1px solid var(--line)",
            borderRadius: 999,
            boxShadow: "0 8px 24px -14px rgba(28,27,61,0.2)",
          }}
        >
          {AGENTS.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)" }}
            >
              <ToolLogo slug={a.slug} size={14} />
              {a.name}
            </a>
          ))}
        </div>
      </div>

      <PageSection style={{ paddingTop: 16 }}>
        <div style={{ display: "grid", gap: 12 }}>
          {AGENTS.map((a) => (
            <AgentRecipe key={a.id} a={a} />
          ))}
        </div>
      </PageSection>

      <ForAgentsMatrix />

      <PageSection>
        <div className="card" style={{ padding: "44px 36px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 36, alignItems: "center" }}>
            <div>
              <span className="eyebrow">Instruction templates</span>
              <h2 className="section-title" style={{ textAlign: "left", marginTop: 14, fontSize: "clamp(28px, 3vw, 40px)" }}>
                Drop-in <em>rules</em> for every agent.
              </h2>
              <p style={{ marginTop: 14, fontSize: 15, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 460 }}>
                Pheme ships ready-made instruction files. Copy the one for your agent into your project root and the agent will know
                to call the memory tools at task start, mid-task, and on completion.
              </p>
              <a href="/docs#templates" className="btn btn-ghost" style={{ marginTop: 22 }}>
                Browse templates →
              </a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {TEMPLATES.map((t) => (
                <div key={t.f} style={{ padding: 14, background: "rgba(255,255,255,0.7)", border: "1px solid var(--line)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      width: 34,
                      height: 38,
                      borderRadius: 6,
                      background: t.color,
                      border: "1px solid var(--line-strong)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: "var(--ink)",
                      position: "relative",
                    }}
                  >
                    <span style={{ position: "absolute", top: 2, right: 2, width: 8, height: 8, borderTop: "1px solid var(--line-strong)", borderRight: "1px solid var(--line-strong)", borderRadius: "0 4px 0 0" }} />
                    md
                  </span>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--ink)" }}>{t.f}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink-3)", marginTop: 3 }}>
                      <ToolLogo slug={t.slug} size={13} />
                      {t.for}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="card" style={{ padding: "44px 36px", background: "linear-gradient(160deg, color-mix(in oklab, var(--lavender) 24%, white), white 70%)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: -10, right: 30 }} className="float-soft" aria-hidden>
            <MotifDove size={140} />
          </div>
          <div style={{ position: "absolute", top: 24, right: 200 }} className="twinkle" aria-hidden>
            <MotifStar size={20} color="#f3d684" />
          </div>
          <div style={{ maxWidth: 540, position: "relative", zIndex: 1 }}>
            <span className="eyebrow">Your stack not here?</span>
            <h2 className="section-title" style={{ textAlign: "left", marginTop: 12 }}>
              We&apos;ll <em>write the recipe</em> for you.
            </h2>
            <p className="section-desc" style={{ textAlign: "left", marginLeft: 0, marginTop: 12 }}>
              If you&apos;re shipping with an agent we haven&apos;t covered, ping us and we&apos;ll put together a working setup. The
              four tools are agent-agnostic; the wrapper is usually 30 lines.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <a href="/#join" className="btn btn-primary">
                Tell us your stack
              </a>
              <a href="/docs" className="btn btn-ghost">
                See the docs
              </a>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}
