/* Icon set for the dense dashboard, ported 1:1 from the design handoff
   (project/dashboard/data.jsx) and the theme toggle's sun/moon. Pure SVG, no
   state — they get pulled into the client bundle by their importer. Colors come
   from `currentColor` / the --c-* tokens on the dashboard root. */

import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

export const Icons = {
  Search: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  Caret: (p: P) => (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" {...p}>
      <path d="M3 4l3 3.5L9 4z" />
    </svg>
  ),
  ChevDown: (p: P) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...p}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  Inbox: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M3 13h5l1 3h6l1-3h5" />
      <path d="M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" />
    </svg>
  ),
  Brain: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5v0a3 3 0 0 0 0 4v0a3 3 0 0 0 3 4 3 3 0 0 0 5 0V4a3 3 0 0 0-3 0z" />
      <path d="M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5v0a3 3 0 0 1 0 4v0a3 3 0 0 1-3 4 3 3 0 0 1-5 0" />
    </svg>
  ),
  Bookmark: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M6 4h12v17l-6-4-6 4z" />
    </svg>
  ),
  Tag: (p: P) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M20.5 13.5L13 21l-9-9 7.5-7.5L20 4l.5 9.5z" />
      <circle cx="9" cy="9" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  Branch: (p: P) => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="9" r="2" />
      <path d="M6 7v10" />
      <path d="M18 11c0 4-6 3-6 8" />
    </svg>
  ),
  Filter: (p: P) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M4 5h16l-6 8v6l-4-2v-4z" />
    </svg>
  ),
  Slider: (p: P) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M4 7h10" />
      <circle cx="17" cy="7" r="2.2" />
      <path d="M10 17h10" />
      <circle cx="7" cy="17" r="2.2" />
    </svg>
  ),
  Layout: (p: P) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 9v11" />
    </svg>
  ),
  Plus: (p: P) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Dots: (p: P) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <circle cx="6" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="18" cy="12" r="1.6" />
    </svg>
  ),
  Bell: (p: P) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M6 9a6 6 0 0 1 12 0v5l2 3H4l2-3z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  ),
  Settings: (p: P) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
  Sparkle: (p: P) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" opacity=".6" />
    </svg>
  ),
  Compose: (p: P) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M4 20h4l11-11-4-4L4 16z" />
      <path d="M14 6l4 4" />
    </svg>
  ),
  Backlink: (p: P) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M10 14L4 20" />
      <path d="M14 10l6-6" />
      <path d="M4 14h6v6" />
      <path d="M20 10h-6V4" />
    </svg>
  ),
  /* Corner brackets pointing outward — "open the full view". */
  Expand: (p: P) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M4 9V4h5" />
      <path d="M20 9V4h-5" />
      <path d="M20 15v5h-5" />
      <path d="M4 15v5h5" />
    </svg>
  ),
  /* Left chevron — "back to the feed" from the full-page entry view. */
  ArrowLeft: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  ),
  Github: (p: P) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-2c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.8 1a9.7 9.7 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .3.3.6.9.6 1.8v2.6c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
    </svg>
  ),
  Sun: (p: P) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  ),
  Moon: (p: P) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" />
    </svg>
  ),
  Panel: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  ),
  Users: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6" />
      <path d="M17.5 14a6 6 0 0 1 3.5 6" />
    </svg>
  ),
};

/* Status icon — filled / half / open / crossed circles for the entry life-cycle.
   Colors map to the theme-aware --c-* tokens so they read on both themes. */
export function StatusIcon({ status }: { status: string }) {
  const wrap = { display: "inline-flex", flex: "0 0 auto" } as const;
  const cVar =
    {
      active: "var(--c-tradeoff)",
      in_progress: "var(--c-question)",
      pending_review: "var(--c-constraint)",
      superseded: "var(--fg-3)",
      archived: "var(--fg-4)",
      discarded: "var(--c-urgent)",
    }[status] || "var(--fg-4)";

  if (status === "active") {
    return (
      <span style={wrap} title="Active">
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ color: cVar }}>
          <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="7" cy="7" r="3.5" fill="currentColor" />
        </svg>
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span style={wrap} title="In progress">
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ color: cVar }}>
          <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7 1 a6 6 0 0 1 0 12 z" fill="currentColor" />
        </svg>
      </span>
    );
  }
  if (status === "pending_review") {
    return (
      <span style={wrap} title="Pending review">
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ color: cVar }}>
          <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" />
        </svg>
      </span>
    );
  }
  if (status === "superseded") {
    return (
      <span style={wrap} title="Superseded">
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ color: cVar }}>
          <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M3 11 L11 3" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
    );
  }
  if (status === "discarded") {
    return (
      <span style={wrap} title="Discarded">
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ color: cVar }}>
          <circle cx="7" cy="7" r="6" fill="currentColor" />
          <path d="M4.5 4.5 L9.5 9.5 M9.5 4.5 L4.5 9.5" style={{ stroke: "var(--bg-1)" }} strokeWidth="1.4" />
        </svg>
      </span>
    );
  }
  return (
    <span style={wrap} title="Archived">
      <svg width="14" height="14" viewBox="0 0 14 14" style={{ color: cVar }}>
        <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </span>
  );
}
