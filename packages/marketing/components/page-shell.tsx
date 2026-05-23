import type { CSSProperties, ReactNode } from "react";

/* Themed background + grain — fixed behind every page. */
export function PageBackground() {
  return (
    <>
      <div className="bg-atmosphere" aria-hidden />
      <div className="bg-grain" aria-hidden />
    </>
  );
}

/* Reusable hero header for interior pages. */
export function PageHero({
  eyebrow,
  title,
  sub,
  ornament,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  ornament?: ReactNode;
}) {
  return (
    <section style={{ position: "relative", padding: "72px 0 32px", overflow: "hidden" }}>
      {ornament && (
        <div className="ornament" aria-hidden>
          {ornament}
        </div>
      )}
      <div className="container" style={{ position: "relative" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            {eyebrow}
          </span>
          <h1 className="hero-headline" style={{ fontSize: "clamp(40px, 6vw, 88px)", marginTop: 18 }}>
            {title}
          </h1>
          {sub && (
            <p className="hero-sub" style={{ marginTop: 22 }}>
              {sub}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* Section wrapper with the standard container. */
export function PageSection({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <section className="section" style={{ paddingTop: 56, paddingBottom: 56, ...style }}>
      <div className="container">{children}</div>
    </section>
  );
}
