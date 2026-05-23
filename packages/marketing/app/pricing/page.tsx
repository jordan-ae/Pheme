import type { Metadata } from "next";
import type { ComponentType, CSSProperties } from "react";
import { PageHero, PageSection } from "@/components/page-shell";
import { PricingFAQ } from "@/components/interior/faq";
import { MotifLyre, MotifColumn, MotifAmphora, MotifLaurel, MotifStar } from "@/components/illustrations";

export const metadata: Metadata = {
  title: "Pricing — Pheme",
  description: "Fully managed memory for AI coding agents. Simple per-seat Team pricing and custom Enterprise plans.",
};

type Tier = {
  id: string;
  name: string;
  tone: string;
  motif: ComponentType<{ size?: number }>;
  featured?: boolean;
  price: string;
  suffix: string;
  pitch: string;
  cta: { label: string; href: string; variant: "ghost" | "primary" };
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "team",
    name: "Team",
    tone: "tone-lav",
    motif: MotifLyre,
    featured: true,
    price: "$20",
    suffix: "/ seat / month",
    pitch: "Hosted memory + scribe. Per-team store, shared keys, branch reviews.",
    cta: { label: "Join waitlist", href: "/#join", variant: "primary" },
    features: [
      "Unlimited memories & agents",
      "Managed Postgres + pgvector",
      "Hosted scribe agent (Claude, GPT, Gemini)",
      "Slack & GitHub PR adapters",
      "Branch-aware memory + merge replay",
      "SSO · audit log · 99.9% SLA",
    ],
  },
  {
    id: "ent",
    name: "Enterprise",
    tone: "tone-peach",
    motif: MotifColumn,
    price: "Custom",
    suffix: "",
    pitch: "VPC deploy, custom retention, design partnership, white-glove onboarding.",
    cta: { label: "Talk to us", href: "#contact", variant: "ghost" },
    features: [
      "Everything in Team",
      "VPC / on-prem deploy",
      "Custom retention & data residency",
      "SOC 2 + DPA + signed BAA",
      "Dedicated Slack channel",
      "Roadmap partnership",
    ],
  },
];

const COMPARE_ROWS: (string | boolean)[][] = [
  ["Memories", "unlimited", "unlimited"],
  ["Seats", "by seat", "unlimited"],
  ["MCP tools", true, true],
  ["Branch-aware memory", true, true],
  ["Scribe agent", "managed", "managed"],
  ["Slack & PR adapters", true, true],
  ["Audit log + SSO", true, true],
  ["VPC / on-prem deploy", false, true],
  ["SOC 2 · DPA · BAA", false, true],
  ["Support", "email + slack", "dedicated"],
];

const thp: CSSProperties = {
  padding: "16px 20px",
  textAlign: "left",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
  background: "rgba(255,255,255,0.4)",
};
const tdp: CSSProperties = { padding: "12px 20px", color: "var(--ink)" };

function mark(on: boolean): CSSProperties {
  return {
    display: "inline-block",
    width: 22,
    height: 22,
    borderRadius: 999,
    background: on ? "color-mix(in oklab, var(--mint) 38%, white)" : "rgba(28,27,61,0.06)",
    color: on ? "#2f7a5e" : "var(--ink-4)",
    lineHeight: "22px",
    fontSize: 12.5,
    fontWeight: 700,
  };
}

function PricingTiers() {
  return (
    <PageSection style={{ paddingTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18, alignItems: "stretch", maxWidth: 760, margin: "0 auto" }}>
        {TIERS.map((t) => {
          const M = t.motif;
          return (
            <div
              key={t.id}
              className={`card ${t.tone}`}
              style={{
                padding: 32,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transform: t.featured ? "translateY(-14px)" : "none",
                boxShadow: t.featured
                  ? "0 30px 60px -28px rgba(28,27,61,0.36), 0 1px 0 rgba(255,255,255,0.7) inset"
                  : "0 24px 60px -36px rgba(28,27,61,0.20), 0 1px 0 rgba(255,255,255,0.7) inset",
                border: t.featured ? "1px solid color-mix(in oklab, var(--accent) 35%, white)" : "1px solid var(--line)",
              }}
            >
              {t.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: 24,
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "var(--accent)",
                    color: "#fff",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    boxShadow: "0 6px 14px -6px color-mix(in oklab, var(--accent) 70%, transparent)",
                  }}
                >
                  Most teams
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <h3 style={{ fontSize: 28, lineHeight: 1.05, margin: 0 }}>{t.name}</h3>
                <M size={56} />
              </div>
              <p style={{ margin: "4px 0 18px", color: "var(--ink-2)", fontSize: 14, lineHeight: 1.55, minHeight: 64 }}>{t.pitch}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 20 }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 56, lineHeight: 1, color: "var(--ink)" }}>{t.price}</span>
                {t.suffix && <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{t.suffix}</span>}
              </div>
              <a href={t.cta.href} className={`btn ${t.cta.variant === "primary" ? "btn-primary" : "btn-ghost"}`} style={{ justifyContent: "center", marginBottom: 24 }}>
                {t.cta.label}
              </a>
              <div
                style={{
                  paddingTop: 18,
                  borderTop: "1px dashed var(--line-strong)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 12,
                }}
              >
                Includes
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                {t.features.map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, fontSize: 13.5, color: "var(--ink)", lineHeight: 1.5 }}>
                    <span style={{ marginTop: 6, width: 6, height: 6, borderRadius: 999, background: "var(--accent)", flex: "0 0 6px" }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </PageSection>
  );
}

function ComparisonTable() {
  return (
    <PageSection>
      <div className="section-header" style={{ marginBottom: 28 }}>
        <span className="eyebrow">Side by side</span>
        <h2 className="section-title">
          What&apos;s <em>in each tier</em>.
        </h2>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ ...thp, width: "34%" }} />
              <th style={{ ...thp, background: "color-mix(in oklab, var(--lavender) 26%, white)", color: "var(--plum)" }}>Team</th>
              <th style={thp}>Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => {
              const [label, ...vals] = row as [string, ...(string | boolean)[]];
              return (
                <tr key={label} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ ...tdp, color: "var(--ink-2)", fontWeight: 500 }}>{label}</td>
                  {vals.map((v, vi) => (
                    <td key={vi} style={{ ...tdp, textAlign: "center" }}>
                      {v === true ? (
                        <span style={mark(true)}>✓</span>
                      ) : v === false ? (
                        <span style={mark(false)}>·</span>
                      ) : (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)" }}>{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
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
        eyebrow="Pricing · honest"
        title={
          <>
            Simple, <em>per-seat</em> pricing.
          </>
        }
        sub={
          <>
            Fully managed memory for your coding agents — we run the store and the scribe so you don&apos;t have to. Start with Team;
            talk to us when you need VPC, SSO, and custom retention.
          </>
        }
        ornament={
          <>
            <div style={{ position: "absolute", top: 40, left: "8%" }} className="float-soft">
              <MotifAmphora size={88} />
            </div>
            <div style={{ position: "absolute", top: 70, right: "7%" }} className="float-soft-2">
              <MotifLaurel size={96} />
            </div>
            <div style={{ position: "absolute", top: 22, left: "42%" }} className="twinkle">
              <MotifStar size={18} color="#8f7cd4" />
            </div>
          </>
        }
      />
      <PricingTiers />
      <ComparisonTable />
      <PageSection>
        <PricingFAQ />
      </PageSection>
    </>
  );
}
