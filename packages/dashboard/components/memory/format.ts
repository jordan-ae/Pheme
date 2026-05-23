/* Pure presentation helpers + metadata for the dense memory dashboard.
   No DOM / no React — safe to import from both the server page (for counts)
   and the client components. The design mocked a rich set of fields (priority,
   a multi-actor activity feed, per-person avatars); the real memory-server
   schema is leaner, so these helpers derive what the design showed from what
   we actually have: UUID ids → short ids, free-text authors → initial avatars,
   ISO timestamps → compact relative dates. */

import type { MemoryEntry, EntryType, EntryStatus } from "@/lib/memory";

/** A real entry annotated with which enrolled project it came from. */
export type DashEntry = MemoryEntry & {
  projectIdentifier: string;
  projectName: string | null;
};

export const ALL_STATUSES: EntryStatus[] = [
  "active",
  "superseded",
  "archived",
  "discarded",
  "pending_review",
];

/* Status life-cycle metadata. `in_progress` isn't in the real schema but is kept
   here harmlessly so grouping never crashes if the server ever introduces it. */
export const STATUS_META: Record<string, { label: string; order: number }> = {
  pending_review: { label: "Pending review", order: 0 },
  in_progress: { label: "In progress", order: 1 },
  active: { label: "Active", order: 2 },
  superseded: { label: "Superseded", order: 3 },
  archived: { label: "Archived", order: 4 },
  discarded: { label: "Discarded", order: 5 },
};

export const TYPE_META: Record<EntryType, { label: string; plural: string; order: number }> = {
  decision: { label: "Decision", plural: "Decisions", order: 0 },
  constraint: { label: "Constraint", plural: "Constraints", order: 1 },
  tradeoff: { label: "Trade-off", plural: "Trade-offs", order: 2 },
  question: { label: "Question", plural: "Questions", order: 3 },
};

const INACTIVE: EntryStatus[] = ["superseded", "archived", "discarded"];
export const isInactive = (status: string) => INACTIVE.includes(status as EntryStatus);

/* ---------- ids / dates ---------- */

/** Real ids are UUIDs; echo the design's compact id column with a short, stable slug. */
export function shortId(id: string): string {
  return id.replace(/-/g, "").slice(0, 6).toUpperCase();
}

/** Compact relative age, matching the design's "2d" / "3w" style. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(d / 365)}y`;
}

/* ---------- people / avatars ---------- */

const AVATAR_PALETTE = [
  "#7ba2cf",
  "#e9a6ad",
  "#8ccab0",
  "#ecc96f",
  "#a994e8",
  "#8caed0",
  "#6fb89a",
  "#f0876f",
  "#b9a6ee",
  "#9cc0e6",
  "#c5bee0",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Deterministic accent for a free-text seed (author, tag) so colors stay stable. */
export function colorFor(seed: string): string {
  return AVATAR_PALETTE[hash(seed) % AVATAR_PALETTE.length];
}

const BOT_HINTS = [
  "claude",
  "cursor",
  "codex",
  "copilot",
  "scribe",
  "agent",
  "[bot]",
  "gpt",
  " ai",
  "windsurf",
  "aider",
];

export function isBot(author: string | null | undefined): boolean {
  if (!author) return false;
  const a = author.toLowerCase();
  return BOT_HINTS.some((h) => a.includes(h));
}

export interface Person {
  name: string;
  initials: string;
  color: string;
  bot: boolean;
}

/** Build an avatar identity from a free-text author string (or null → "Unknown"). */
export function personFor(author: string | null | undefined): Person {
  const name = author?.trim() || "Unknown";
  const bot = isBot(name);
  const words = name.split(/[\s._@-]+/).filter(Boolean);
  const initials =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  return { name, initials, color: colorFor(name), bot };
}

/* ---------- tags ---------- */

const TAG_COLOR: Record<string, string> = {
  auth: "#9cc0e6",
  api: "#a994e8",
  db: "#ecc96f",
  embeddings: "#e9a6ad",
  branching: "#8ccab0",
  cli: "#c5bee0",
  mcp: "#7ba2cf",
  perf: "#f0876f",
  schema: "#b9a6ee",
  security: "#e58a6e",
  tests: "#8ccab0",
};

export function tagColor(tag: string): string {
  return TAG_COLOR[tag] ?? colorFor(tag);
}

/* ---------- type chip class (maps to CSS-module keys) ---------- */
export const TYPE_CHIP_KEY: Record<EntryType, string> = {
  decision: "typeDecision",
  constraint: "typeConstraint",
  tradeoff: "typeTradeoff",
  question: "typeQuestion",
};
