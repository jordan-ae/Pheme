import type { Metadata } from "next";
import type { ComponentType } from "react";
import { PageHero, PageSection } from "@/components/page-shell";
import { WaitlistForm } from "@/components/waitlist-form";
import {
  MotifScroll,
  MotifAmphora,
  MotifKey,
  MotifBranches,
  MotifColumn,
  MotifMap,
  MotifDove,
  MotifLyre,
  MotifLaurel,
  MotifPortal,
  MotifStar,
} from "@/components/illustrations";

export const metadata: Metadata = {
  title: "Changelog — Pheme",
  description: "Public shipping notes from the Pheme build — features, infra shifts, and decisions worth finding later.",
};

type Tag = "feature" | "infra" | "fix";

const CHANGELOG: { date: string; version: string; title: string; tag: Tag; body: string; motif: ComponentType<{ size?: number }> }[] = [
  {
    date: "May 14, 2026",
    version: "v0.4.0",
    title: "Scribe agent ships in preview",
    tag: "feature",
    body: "The always-on auto-capture agent is live. Tools: search_memory, log_entry, supersede_entry, flag_for_review. Provider-agnostic via Vercel AI SDK — point it at Claude, GPT, or Gemini with one env var.",
    motif: MotifScroll,
  },
  {
    date: "May 09, 2026",
    version: "v0.3.4",
    title: "Bundle estimation switched to chars/4 heuristic",
    tag: "infra",
    body: "Real tokenizer calls were adding 80ms per /context request. Heuristic is good enough for budget enforcement — agents count exact tokens themselves. Superseded the prior decision.",
    motif: MotifAmphora,
  },
  {
    date: "May 02, 2026",
    version: "v0.3.0",
    title: "MCP wrapper exposes four tools natively",
    tag: "feature",
    body: "memory-mcp is a stdio MCP server. Once registered with Claude Code, Cursor, or Windsurf, the agent sees get_context, search_memory, log_entry, and list_open_questions as first-class tools.",
    motif: MotifKey,
  },
  {
    date: "Apr 24, 2026",
    version: "v0.2.7",
    title: "Pending review queue + supersede flow",
    tag: "feature",
    body: "Low-confidence scribe entries land in a pending_review state, excluded from /context until a human confirms. Updating a decision now creates a v2 and marks v1 as superseded — history preserved.",
    motif: MotifBranches,
  },
  {
    date: "Apr 18, 2026",
    version: "v0.2.4",
    title: "Branch-scoped writes; main-scoped reads",
    tag: "feature",
    body: "Entries are now tied to the git branch they were written on. /context on main never sees a half-baked feature-branch decision. Merge replays the supersede chain.",
    motif: MotifBranches,
  },
  {
    date: "Apr 14, 2026",
    version: "v0.2.0",
    title: "AD-01 through AD-12 seeded as the first 12 entries",
    tag: "infra",
    body: "Bootstrapping decision: the project's own architecture decisions are seeded into the memory server. Pheme dogfoods itself.",
    motif: MotifColumn,
  },
  {
    date: "Apr 02, 2026",
    version: "v0.1.0",
    title: "REST API frozen at three endpoints",
    tag: "infra",
    body: "/log, /context, /search. We decided early that we'd rather have three endpoints we believed in than seven we apologized for. Frozen and versioned.",
    motif: MotifMap,
  },
  {
    date: "Mar 18, 2026",
    version: "v0.0.1",
    title: "Pheme is announced",
    tag: "fix",
    body: "Hello world. Built out of frustration after the fourth time explaining the embedding dim to a fresh Cursor window. Named after Pheme — Φήμη — the messenger goddess.",
    motif: MotifDove,
  },
];

const ROADMAP = [
  {
    when: "Q3 2026",
    title: "Memory diff in PRs",
    body: "When a branch lands, surface the memory deltas inline in the PR — what was logged, what was superseded, what's still open.",
  },
  {
    when: "Q3 2026",
    title: "Team-wide voting on superseding",
    body: "When an agent proposes a supersede that crosses a confidence threshold, route to the team for a quick thumbs up/down before it lands.",
  },
  {
    when: "Q4 2026",
    title: "Embedded scribe-agent SDK",
    body: "Embed the scribe loop in your own runtime — no separate process, same telemetry. For teams already running long-lived agents.",
  },
];

const TAG_STYLE: Record<Tag, { bg: string; color: string }> = {
  feature: { bg: "color-mix(in oklab, var(--lavender) 32%, white)", color: "var(--plum)" },
  infra: { bg: "color-mix(in oklab, var(--butter) 38%, white)", color: "#aa7530" },
  fix: { bg: "color-mix(in oklab, var(--mint) 36%, white)", color: "#2f7a5e" },
};

function TimelineEntry({ e }: { e: (typeof CHANGELOG)[number] }) {
  const Motif = e.motif;
  const tag = TAG_STYLE[e.tag];
  return (
    <li style={{ position: "relative", paddingLeft: 64, paddingBottom: 36 }}>
      <div
        style={{
          position: "absolute",
          left: 14,
          top: 6,
          width: 20,
          height: 20,
          borderRadius: 999,
          background: "white",
          border: "1.4px solid var(--line-strong)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--accent)" }} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 88px",
          gap: 20,
          alignItems: "flex-start",
          padding: 22,
          background: "rgba(255,255,255,0.85)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          boxShadow: "0 12px 30px -22px rgba(28,27,61,0.2)",
        }}
      >
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{e.date}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-4)" }}>·</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-2)" }}>{e.version}</span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                padding: "3px 9px",
                borderRadius: 999,
                background: tag.bg,
                color: tag.color,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginLeft: 4,
              }}
            >
              {e.tag}
            </span>
          </div>
          <h3 style={{ fontSize: 24, lineHeight: 1.1, margin: 0 }}>{e.title}</h3>
          <p style={{ margin: "12px 0 0", color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.6, maxWidth: 620 }}>{e.body}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Motif size={64} />
        </div>
      </div>
    </li>
  );
}

function RoadmapSection() {
  const tones = ["tone-lav", "tone-mint", "tone-peach"];
  const motifs = [MotifMap, MotifLaurel, MotifPortal];
  return (
    <PageSection>
      <div className="section-header" style={{ marginBottom: 32 }}>
        <span className="eyebrow">What&apos;s next</span>
        <h2 className="section-title">
          The <em>roadmap</em>, as far as we&apos;ll commit.
        </h2>
        <p className="section-desc">
          Honest about what&apos;s in flight. Items on the public roadmap have a design partner asking for them — we don&apos;t ship
          speculative features.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {ROADMAP.map((r, i) => {
          const M = motifs[i];
          return (
            <div key={r.title} className={`card ${tones[i]}`} style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {r.when}
                </span>
                <M size={48} />
              </div>
              <h3 style={{ fontSize: 22, margin: 0, lineHeight: 1.1 }}>{r.title}</h3>
              <p style={{ margin: "12px 0 0", color: "var(--ink-2)", fontSize: 14, lineHeight: 1.55 }}>{r.body}</p>
            </div>
          );
        })}
      </div>
    </PageSection>
  );
}

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Changelog · public"
        title={
          <>
            Shipping <em>notes.</em>
          </>
        }
        sub={
          <>
            Public notes from the build. We post on every notable change — features, infra shifts, and decisions we&apos;d want our
            future selves to find.
          </>
        }
        ornament={
          <>
            <div style={{ position: "absolute", top: 30, left: "8%" }} className="float-soft">
              <MotifScroll size={84} />
            </div>
            <div style={{ position: "absolute", top: 60, right: "10%" }} className="float-soft-2">
              <MotifLyre size={84} />
            </div>
            <div style={{ position: "absolute", top: 130, left: "44%" }} className="twinkle">
              <MotifStar size={18} color="#e58a6e" />
            </div>
            <div style={{ position: "absolute", top: 16, right: "44%" }} className="twinkle">
              <MotifStar size={14} color="#8f7cd4" />
            </div>
          </>
        }
      />

      <PageSection style={{ paddingTop: 8, paddingBottom: 32 }}>
        <div
          className="card"
          style={{
            padding: "24px 28px",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 24,
            background: "linear-gradient(120deg, color-mix(in oklab, var(--peach) 22%, white), white 70%)",
          }}
        >
          <MotifDove size={52} />
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, lineHeight: 1.1, color: "var(--ink)" }}>
              Get the changelog by carrier dove.
            </div>
            <div style={{ marginTop: 4, fontSize: 13.5, color: "var(--ink-2)" }}>
              One email per release. No fluff. Unsubscribe with a click.
            </div>
          </div>
          <WaitlistForm source="changelog" buttonLabel="Subscribe" style={{ maxWidth: 320 }} />
        </div>
      </PageSection>

      <PageSection>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <span className="eyebrow">Recent</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>8 releases · last 9 weeks</span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 23,
                top: 12,
                bottom: 36,
                width: 2,
                background: "repeating-linear-gradient(to bottom, var(--line-strong) 0 4px, transparent 4px 9px)",
              }}
            />
            {CHANGELOG.map((e) => (
              <TimelineEntry key={e.version} e={e} />
            ))}
          </ul>
          <div style={{ marginTop: 24, paddingLeft: 64, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
            ↑ that&apos;s the whole log so far. Subscribe above to be first on the next one.
          </div>
        </div>
      </PageSection>

      <RoadmapSection />
    </>
  );
}
