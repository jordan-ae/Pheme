import { MemoryOrchard } from "@/components/illustrations";

export function Problem() {
  return (
    <section className="section">
      <div className="container">
        <div className="reveal" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, alignItems: "center" }}>
          <div>
            <span className="eyebrow">The problem</span>
            <h2 className="section-title" style={{ textAlign: "left", marginTop: 16 }}>
              Your agent doesn&apos;t have amnesia.
              <br />
              Your <em style={{ color: "var(--accent)" }}>project</em> does.
            </h2>
            <p className="section-desc" style={{ textAlign: "left", marginLeft: 0 }}>
              Every coding agent ships with the same trick: a long context window and a clever way to forget it. Sessions get
              compacted. Decisions get re-litigated. The third time you explain why the embedding dim is 1536, you start to wonder
              who&apos;s actually building this project.
            </p>
            <div className="stat-grid">
              <div className="stat">
                <div className="stat-n">14×</div>
                <div className="stat-l">average re-explanations per week</div>
              </div>
              <div className="stat">
                <div className="stat-n">
                  38<span style={{ fontSize: "0.6em" }}>%</span>
                </div>
                <div className="stat-l">agent edits that revert prior decisions</div>
              </div>
              <div className="stat">
                <div className="stat-n">0</div>
                <div className="stat-l">memory between two Cursor sessions</div>
              </div>
            </div>
          </div>
          <div>
            <MemoryOrchard />
          </div>
        </div>
      </div>
    </section>
  );
}
