import { HeroShowcase } from "./hero-showcase";
import { HeroSceneLeft, HeroSceneRight, MotifStar, Squiggle } from "@/components/illustrations";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-illos ornament" aria-hidden>
        <div className="hero-illo float-soft" style={{ top: 20, left: "-2%", width: 360, height: 420 }}>
          <HeroSceneLeft />
        </div>
        <div className="hero-illo float-soft-2" style={{ top: 0, right: "-3%", width: 380, height: 440 }}>
          <HeroSceneRight />
        </div>
        <div className="hero-illo twinkle" style={{ top: 80, left: "38%" }}>
          <MotifStar size={20} color="#8f7cd4" />
        </div>
        <div className="hero-illo twinkle" style={{ top: 280, left: "30%", animationDelay: "2s" }}>
          <MotifStar size={14} color="#e58a6e" />
        </div>
        <div className="hero-illo twinkle" style={{ top: 200, right: "32%", animationDelay: "1.2s" }}>
          <MotifStar size={16} color="#f3d684" />
        </div>
      </div>

      <div className="container">
        <div style={{ textAlign: "center" }}>
          <span className="hero-tag rise-in d0">
            <span className="hero-tag-pill">v0.4</span>
            <span>Scribe agent · auto-capture from Claude Code, Cursor, Windsurf</span>
            <span style={{ opacity: 0.5 }}>→</span>
          </span>
        </div>

        <h1 className="hero-headline rise-in d1">
          Code agents that{" "}
          <span className="italic-accent">
            <em>remember</em>
            <Squiggle color="var(--accent)" animated />
          </span>{" "}
          <br />
          what you decided.
        </h1>

        <p className="hero-sub rise-in d2">
          Pheme is the shared memory layer for AI coding agents. Decisions, constraints, and tradeoffs travel with the project —
          not the conversation.
        </p>

        <div className="hero-cta-row rise-in d3">
          <a href="#join" className="btn btn-primary">
            Join the waitlist
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#how" className="btn btn-ghost">
            See how it works
          </a>
        </div>

        <div className="hero-meta-row rise-in d4">
          <span className="hero-meta">
            <span className="hero-meta-dot pulse-soft" />
            no agent lock-in
          </span>
          <span className="hero-meta">
            <span className="hero-meta-dot pulse-soft" style={{ animationDelay: "0.8s" }} />
            your code stays put
          </span>
          <span className="hero-meta">
            <span className="hero-meta-dot pulse-soft" style={{ animationDelay: "1.6s" }} />
            private beta · v0.4
          </span>
        </div>

        <div style={{ marginTop: 72 }} className="rise-in d5">
          <HeroShowcase />
        </div>
      </div>
    </section>
  );
}
