"use client";

import { useState } from "react";

const FAQ = [
  {
    q: "Why does Pheme need a separate memory layer? Doesn't my agent's context window do this?",
    a: "Context windows reset. Sessions compact. Branch-specific decisions don't travel cleanly between agents. Pheme keeps the load-bearing decisions where they belong — attached to the project, not the conversation.",
  },
  {
    q: "Is Pheme locked to Claude Code?",
    a: "No. Pheme exposes an MCP server and a REST API. Anything that speaks either can read and write memory. Today: Claude Code, Cursor, Windsurf, Zed, Codex CLI, Aider, Continue.",
  },
  {
    q: "Where does my memory live?",
    a: "Pheme is a fully managed service — we run the Postgres + pgvector store and the scribe for you. Your team gets an isolated memory store and an API key; there's nothing to deploy or operate.",
  },
  {
    q: "How do you handle proprietary code in the scribe loop?",
    a: "The scribe extracts decisions — titles, rationale, constraints — not your source. It runs against the model provider you choose (Anthropic, OpenAI, Google), and we store the distilled memory entries, never your codebase.",
  },
  {
    q: "What counts as a 'seat'?",
    a: "A human teammate who reads or writes memory from any agent. CI bots, scribe webhooks, and PR adapters are free.",
  },
  {
    q: "When will Team be generally available?",
    a: "We're onboarding ~5 new teams per week from the waitlist. Expect general availability mid-Q3 2026.",
  },
];

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: "1px solid var(--line)", padding: "20px 4px" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          border: 0,
          padding: 0,
          fontFamily: "var(--font-serif)",
          fontSize: 20,
          color: "var(--ink)",
          cursor: "pointer",
          lineHeight: 1.25,
          gap: 16,
        }}
      >
        <span>{q}</span>
        <span
          style={{
            flex: "0 0 auto",
            fontFamily: "var(--font-mono)",
            fontSize: 18,
            color: "var(--ink-3)",
            transform: open ? "rotate(45deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          +
        </span>
      </button>
      {open && <p style={{ margin: "14px 0 0", maxWidth: 680, color: "var(--ink-2)", fontSize: 15, lineHeight: 1.6 }}>{a}</p>}
    </div>
  );
}

export function PricingFAQ() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <h2 className="section-title" style={{ textAlign: "left", fontSize: "clamp(28px, 3vw, 40px)" }}>
          Common <em>questions.</em>
        </h2>
        <a href="#contact" className="btn btn-ghost">
          Ask us anything →
        </a>
      </div>
      <div>
        {FAQ.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
        ))}
        <div style={{ borderTop: "1px solid var(--line)", height: 4 }} />
      </div>
    </div>
  );
}
