import { ToolLogo, hasToolLogo } from "./tool-logos";

/* Agents Pheme rides along with. `slug` maps to an official logo in tool-logos.tsx;
   tools with no obtainable published mark (Aider, Continue) render a neutral dot
   — we don't substitute a made-up logo. */
const ITEMS: { name: string; slug: string }[] = [
  { name: "Claude Code", slug: "claude" },
  { name: "Codex", slug: "codex" },
  { name: "Cursor", slug: "cursor" },
  { name: "Windsurf", slug: "windsurf" },
  { name: "Zed", slug: "zed" },
  { name: "Aider", slug: "aider" },
  { name: "Continue", slug: "continue" },
  { name: "Cline", slug: "cline" },
  { name: "OpenCode", slug: "opencode" },
];

export function Marquee() {
  return (
    <section className="section" style={{ padding: "48px 0" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span className="eyebrow">Same memory, every loop</span>
        </div>
        <div className="marquee">
          <div className="marquee-track">
            {[...ITEMS, ...ITEMS].map((it, i) => (
              <span key={i} className="marquee-item">
                {hasToolLogo(it.slug) ? (
                  <ToolLogo slug={it.slug} />
                ) : (
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--ink-3)", opacity: 0.45 }} />
                )}
                {it.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
