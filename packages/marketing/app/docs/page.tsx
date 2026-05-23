import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DocsSidebar } from "@/components/interior/docs-sidebar";
import { MotifMap, MotifLaurel, MotifStar, MotifPortal, MotifKey, MotifScroll, MotifAmphora, MotifDove } from "@/components/illustrations";

export const metadata: Metadata = {
  title: "Docs — Pheme",
  description: "How to connect your coding agent to Pheme — the shared memory layer for AI coding agents.",
};

function DocsCodeBlock({ code, lang = "bash", label }: { code: string; lang?: string; label?: string }) {
  return (
    <div style={{ margin: "16px 0", borderRadius: 14, overflow: "hidden", border: "1px solid #2a274f", background: "#1c1b3d" }}>
      {label && (
        <div
          style={{
            padding: "8px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "rgba(251,246,238,0.65)",
          }}
        >
          <span>{label}</span>
          <span style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 10, opacity: 0.6 }}>{lang}</span>
        </div>
      )}
      <pre style={{ margin: 0, padding: "16px 22px", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "#fbf6ee", lineHeight: 1.65, overflowX: "auto" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function DocSection({ id, eyebrow, title, children, motif }: { id: string; eyebrow: string; title: string; children: ReactNode; motif?: ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: 100, padding: "32px 0", borderTop: "1px solid var(--line)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18 }}>
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 style={{ fontSize: 36, marginTop: 10, lineHeight: 1.05 }}>{title}</h2>
        </div>
        {motif}
      </div>
      <div style={{ marginTop: 20, color: "var(--ink-2)", fontSize: 15.5, lineHeight: 1.65, maxWidth: 720 }}>{children}</div>
    </section>
  );
}

function DocSub({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div id={id} style={{ scrollMarginTop: 100, padding: "24px 0 8px" }}>
      <h3 style={{ fontSize: 22, margin: 0, lineHeight: 1.15 }}>{title}</h3>
      <div style={{ marginTop: 8, color: "var(--ink-2)", fontSize: 15.5, lineHeight: 1.65, maxWidth: 720 }}>{children}</div>
    </div>
  );
}

function Callout({ kind = "info", children }: { kind?: "info" | "warn" | "ok"; children: ReactNode }) {
  const palette = {
    info: { bg: "color-mix(in oklab, var(--sky) 30%, white)", border: "color-mix(in oklab, var(--sky) 50%, white)", text: "#1f5681" },
    warn: { bg: "color-mix(in oklab, var(--butter) 40%, white)", border: "color-mix(in oklab, var(--butter) 60%, white)", text: "#8a5e1f" },
    ok: { bg: "color-mix(in oklab, var(--mint) 32%, white)", border: "color-mix(in oklab, var(--mint) 52%, white)", text: "#2f7a5e" },
  } as const;
  const p = palette[kind];
  const label = { info: "Note", warn: "Heads up", ok: "Tip" }[kind];
  return (
    <div style={{ margin: "16px 0", padding: "14px 18px", background: p.bg, border: `1px solid ${p.border}`, borderRadius: 12 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: p.text, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ color: "var(--ink)", fontSize: 14.5, lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function DocsContent() {
  return (
    <div>
      <DocSection id="connect" eyebrow="Get started · ~2 min" title="Connect your agent" motif={<MotifPortal size={64} />}>
        <p>
          Pheme is a fully managed memory layer — we run the store and the scribe for you. To start, point your MCP-speaking agent at
          your Pheme workspace with your API key. Once connected, every agent on the project reads and writes the same memory.
        </p>
        <Callout>
          You&apos;ll need a Pheme workspace API key and a coding agent that speaks MCP — Claude Code, Cursor, or Windsurf are all fine.
          Don&apos;t have a key yet? <a href="/#join" style={{ color: "var(--accent)" }}>Request access →</a>
        </Callout>
      </DocSection>

      <DocSub id="key" title="1 · Get your key">
        <p>
          Your workspace key is issued when your team is onboarded and looks like <code className="kbd">phm_live_…</code>. Treat it like
          a password — it grants read and write access to your team&apos;s memory.
        </p>
      </DocSub>

      <DocSub id="configure" title="2 · Add Pheme to your agent">
        <p>
          Drop the MCP entry into your agent&apos;s config once. It points at your hosted Pheme workspace; no local install or server to
          run.
        </p>
        <DocsCodeBlock label="~/.config/agent/mcp.json" lang="json" code={`{
  "mcpServers": {
    "pheme-memory": {
      "command": "npx",
      "args": ["-y", "@pheme/memory-mcp"],
      "env": {
        "MEMORY_SERVER_URL": "https://memory.pheme.dev",
        "MEMORY_API_KEY": "phm_live_..."
      }
    }
  }
}`} />
        <Callout kind="ok">
          See <a href="/for-agents" style={{ color: "var(--accent)" }}>For agents</a> for copy-paste configs for Claude Code, Cursor,
          Windsurf, and Codex.
        </Callout>
      </DocSub>

      <DocSub id="verify" title="3 · Your first memory">
        <p>
          Restart your agent. The four Pheme tools appear, and the agent calls <code className="kbd">get_context</code> at the start of
          each task. The first time it logs a decision, every other agent on the project sees it.
        </p>
        <Callout kind="ok">
          From here, when an agent decides something load-bearing — &quot;use pgvector over a dedicated vector DB&quot; — it calls{" "}
          <code className="kbd">log_entry</code>, and that decision travels with the project from then on.
        </Callout>
      </DocSub>

      <DocSection id="mcp" eyebrow="MCP server" title="Four tools, one key" motif={<MotifKey size={64} />}>
        <p>
          Pheme exposes its REST API as four agent-callable MCP tools. Configure it once and every project your agent opens gets memory.
        </p>
      </DocSection>

      <DocSub id="tools" title="The four tools">
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 12 }}>
          {([
            ["get_context", "Right-sized bundle for the current task. Respects token budget."],
            ["search_memory", "Vector + BM25 hybrid retrieval. Returns top-k with scores."],
            ["log_entry", "Write a new decision, constraint, tradeoff, or question."],
            ["list_open_questions", "Surface unresolved branch questions to the agent."],
          ] as const).map(([name, desc]) => (
            <li
              key={name}
              style={{ padding: "12px 14px", background: "rgba(255,255,255,0.65)", border: "1px solid var(--line)", borderRadius: 12, display: "grid", gridTemplateColumns: "180px 1fr", gap: 18, alignItems: "center" }}
            >
              <code style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--plum)" }}>{name}</code>
              <span style={{ fontSize: 14, color: "var(--ink-2)" }}>{desc}</span>
            </li>
          ))}
        </ul>
      </DocSub>

      <DocSub id="transports" title="Transports">
        <p>
          Two transports ship today: <code className="kbd">stdio</code> (default — what most MCP clients use) and{" "}
          <code className="kbd">http</code> (for remote agents and serverless loops). Same four tools, same hosted memory either way.
        </p>
      </DocSub>

      <DocSection id="cli" eyebrow="CLI" title="Pheme from the terminal" motif={<MotifScroll size={56} />}>
        <p>
          The <code className="kbd">pheme</code> CLI speaks the REST API under the hood — handy for batch operations like searching,
          exporting, or wiring up custom hooks.
        </p>
      </DocSection>

      <DocSub id="cli-cmds" title="Commands">
        <DocsCodeBlock label="terminal" code={`pheme log decision "pgvector over dedicated vector DB"
pheme search "embedding dim"
pheme context --branch=feature/queue --budget=3000
pheme supersede AD-04 --reason="HNSW failed at 50k vectors"
pheme export --format=json > memory.json`} />
      </DocSub>

      <DocSection id="schemas" eyebrow="Schemas" title="Two shapes you'll touch" motif={<MotifAmphora size={56} />}>
        <p>
          Every value flowing through Pheme is one of two shapes: an <strong>entry</strong> (a single memory) or a{" "}
          <strong>context bundle</strong> (a budgeted list returned from <code className="kbd">/context</code>).
        </p>
      </DocSection>

      <DocSub id="entry" title="Entry">
        <DocsCodeBlock label="types/entry.ts" lang="ts" code={`type EntryType = "decision" | "constraint" | "tradeoff" | "question";

export interface Entry {
  id: string;              // "AD-01"
  type: EntryType;
  title: string;
  body: string;
  files: string[];         // glob patterns
  branch: string;          // "main" or "feature/..."
  version: number;
  supersedes?: string;     // "AD-04"
  createdAt: string;       // ISO
  status: "active" | "pending_review" | "superseded";
}`} />
      </DocSub>

      <DocSub id="context" title="Context bundle">
        <DocsCodeBlock label="types/context.ts" lang="ts" code={`export interface ContextBundle {
  branch: string;
  budget: number;          // requested token budget
  tokens: number;          // actual after assembly
  applied: Entry[];        // included in the bundle
  dropped: { entry: Entry; reason: "below_threshold" | "over_budget" }[];
}`} />
      </DocSub>

      <DocSection id="templates" eyebrow="Instruction templates" title="Drop-in files for every agent" motif={<MotifDove size={56} />}>
        <p>
          Pheme ships starter instruction files. Drop one into your project root and your agent will know <em>to call</em> the memory
          tools at task start, mid-task, and on completion — without you having to remind it each session.
        </p>
      </DocSection>

      <DocSub id="claude-md" title="CLAUDE.md">
        <DocsCodeBlock label="CLAUDE.md" lang="md" code={`# Project memory: Pheme

This project uses Pheme for persistent memory. Before responding:

1. Call \`get_context\` with the files you're touching.
2. Cite every constraint inline. If a constraint blocks the task, stop and ask.
3. After the task, call \`log_entry\` with any new decision worth keeping.

Never silently override an existing decision. Use \`supersede\` and explain why.`} />
      </DocSub>

      <div
        style={{
          marginTop: 56,
          padding: "24px 0",
          borderTop: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--ink-3)",
        }}
      >
        <span>Last updated · May 23, 2026</span>
        <span>
          Questions?{" "}
          <a href="mailto:hi@phemesh.dev" style={{ color: "var(--accent)" }}>
            hi@phemesh.dev
          </a>
        </span>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <section style={{ position: "relative", padding: "64px 0 8px", overflow: "hidden" }}>
        <div className="ornament" aria-hidden>
          <div style={{ position: "absolute", top: 40, right: "8%" }} className="float-soft">
            <MotifMap size={88} />
          </div>
          <div style={{ position: "absolute", top: 80, left: "6%" }} className="float-soft-2">
            <MotifLaurel size={88} />
          </div>
          <div style={{ position: "absolute", top: 30, left: "40%" }} className="twinkle">
            <MotifStar size={16} color="#8f7cd4" />
          </div>
        </div>
        <div className="container" style={{ position: "relative" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>
              Docs · v0.4
            </span>
            <h1 className="hero-headline" style={{ fontSize: "clamp(40px, 5.4vw, 76px)", marginTop: 16 }}>
              Read the <em>map.</em>
            </h1>
            <p className="hero-sub" style={{ marginTop: 18 }}>
              Everything you need to connect your agent to Pheme and put your team&apos;s decisions to work. Start with Connect; the
              reference is here when you need it.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 12 }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 48, alignItems: "flex-start" }}>
          <DocsSidebar />
          <DocsContent />
        </div>
      </section>
    </>
  );
}
