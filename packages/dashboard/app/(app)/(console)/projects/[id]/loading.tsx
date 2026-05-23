/* Instant navigation feedback for the per-project memory page. This page does a
   server fetch (listEntries, up to 200) on every visit, so without a loading state
   the route would block on a blank screen for the duration. The skeleton mirrors
   the real layout (header + a stack of entry cards) so the transition reads as
   immediate. Placeholder bars use subtle inline tints — no new CSS, theme-neutral. */

const bar = (w: number | string, h: number, mt = 0): React.CSSProperties => ({
  width: w,
  height: h,
  marginTop: mt,
  borderRadius: 6,
  background: "rgba(255, 255, 255, 0.06)",
});

export default function Loading() {
  return (
    <div aria-busy="true" style={{ animation: "none" }}>
      <header className="page-head">
        <div className="row" style={{ gap: 12 }}>
          <span className="eyebrow">Project memory</span>
        </div>
        <div style={bar(280, 34, 14)} />
        <div style={bar(200, 14, 12)} />
      </header>

      <div className="stack" style={{ gap: 14, marginTop: 28 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              padding: 18,
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.06)",
              background: "rgba(255, 255, 255, 0.02)",
            }}
          >
            <div style={bar("40%", 16)} />
            <div style={bar("90%", 12, 14)} />
            <div style={bar("70%", 12, 8)} />
          </div>
        ))}
      </div>
    </div>
  );
}
