import { MotifAmphora, MotifDove, MotifStar } from "@/components/illustrations";
import { WaitlistForm } from "@/components/waitlist-form";

export function CTA() {
  return (
    <section id="join" className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <div
          className="card"
          style={{
            padding: "56px 48px",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(160deg, color-mix(in oklab, var(--lavender) 28%, white), white 70%)",
          }}
        >
          <div style={{ position: "absolute", top: -10, left: -20, opacity: 0.85 }} className="float-soft" aria-hidden>
            <MotifAmphora size={120} />
          </div>
          <div style={{ position: "absolute", bottom: -10, right: 10 }} className="float-soft-2" aria-hidden>
            <MotifDove size={140} />
          </div>
          <div style={{ position: "absolute", top: 30, right: 80 }} className="twinkle" aria-hidden>
            <MotifStar size={22} color="#f3d684" />
          </div>

          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>
              Waitlist · private beta
            </span>
            <h2 className="section-title" style={{ marginTop: 14 }}>
              Stop re-explaining <em>everything.</em>
            </h2>
            <p className="section-desc" style={{ marginTop: 12 }}>
              Pheme is in private beta for design partners shipping with Claude Code, Cursor, and Windsurf. Five new teams onboarded
              each week.
            </p>
            <div style={{ display: "flex", justifyContent: "center", margin: "28px 0 0" }}>
              <WaitlistForm source="home" buttonLabel="Request access" />
            </div>
            <div style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
              ~2 day review · MIT license · self-host or managed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
