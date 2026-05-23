import type { MemoryEntry, EntryType } from "@/lib/memory";

const TYPE_META: Record<EntryType, { cls: string; label: string }> = {
  decision: { cls: "chip-decision", label: "Decision" },
  constraint: { cls: "chip-constraint", label: "Constraint" },
  tradeoff: { cls: "chip-tradeoff", label: "Trade-off" },
  question: { cls: "chip-question", label: "Open question" },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function EntryCard({ entry }: { entry: MemoryEntry }) {
  const meta = TYPE_META[entry.type];
  const inactive = entry.status !== "active";

  return (
    <article className={`entry${inactive ? " is-inactive" : ""}`}>
      <div className="entry-head">
        <span className={`chip ${meta.cls}`}>{meta.label}</span>
        {entry.branch !== "global" && <span className="badge">{entry.branch}</span>}
        {inactive && (
          <span className={`badge badge-status-${entry.status}`}>{entry.status}</span>
        )}
      </div>

      <h3 className="entry-title">{entry.title}</h3>
      <p className="entry-body">{entry.body}</p>

      {entry.rationale && (
        <div className="entry-why">
          <strong style={{ color: "var(--ink)" }}>Why:</strong> {entry.rationale}
        </div>
      )}

      <div className="entry-meta">
        {entry.author && <span>✶ {entry.author}</span>}
        <span>scope: {entry.scope}</span>
        <span>{fmtDate(entry.createdAt)}</span>
        {entry.tags.length > 0 && <span>#{entry.tags.slice(0, 4).join(" #")}</span>}
      </div>
    </article>
  );
}
