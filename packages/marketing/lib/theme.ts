/* ----------------------------------------------------------------
   Shared theme tokens for the live theme switcher.

   The landing prototype shipped a "Tweaks" panel exposing brand
   accent, atmosphere warmth, and hero ornaments. We keep those as a
   real, persisted user switcher (see components/theme-switcher.tsx).
   These maps are the single source of truth — consumed both by the
   switcher UI and by the pre-paint inline script in app/layout.tsx
   that applies stored preferences before first paint (no flash).
   ---------------------------------------------------------------- */

export type Accent = "#8f7cd4" | "#e58a6e" | "#3d8c6f" | "#1c1b3d";
export type Warmth = "cream" | "cool" | "rose";

export const ACCENT_OPTIONS: { value: Accent; label: string }[] = [
  { value: "#8f7cd4", label: "Lavender" },
  { value: "#e58a6e", label: "Peach" },
  { value: "#3d8c6f", label: "Olive" },
  { value: "#1c1b3d", label: "Ink" },
];

/* Accent hex → soft tint (lowercase keys). */
export const ACCENT_SOFT: Record<string, string> = {
  "#8f7cd4": "rgba(143,124,212,0.18)",
  "#e58a6e": "rgba(229,138,110,0.20)",
  "#3d8c6f": "rgba(61,140,111,0.18)",
  "#1c1b3d": "rgba(28,27,61,0.10)",
};

/* Soft painterly radial wash, shared across warmth bases. */
const RADIALS = [
  "radial-gradient(60% 50% at 8% 0%, rgba(185,209,234,0.42), transparent 60%)",
  "radial-gradient(50% 45% at 92% 4%, rgba(201,184,240,0.42), transparent 65%)",
  "radial-gradient(75% 55% at 55% 0%, rgba(168,214,192,0.20), transparent 70%)",
  "radial-gradient(80% 50% at 100% 100%, rgba(201,184,240,0.26), transparent 65%)",
  "radial-gradient(60% 40% at 0% 80%, rgba(185,209,234,0.24), transparent 70%)",
].join(",\n    ");

const BASE: Record<Warmth, string> = {
  cream: "linear-gradient(180deg, #f7f0e0 0%, #fbf6ee 38%, #fbf6ee 70%, #f5ecd9 100%)",
  cool: "linear-gradient(180deg, #ecf0f5 0%, #f1f3f7 38%, #f6f7fa 70%, #eaeef3 100%)",
  rose: "linear-gradient(180deg, #fbe9e3 0%, #fdf2ec 38%, #fbf6ee 70%, #fbe6e1 100%)",
};

export const WARMTH_LABEL: Record<Warmth, string> = {
  cream: "Warm",
  cool: "Cool",
  rose: "Rose",
};

/* Full atmosphere background string per warmth (radials over base). */
export const WARMTH_ATMOSPHERE: Record<Warmth, string> = {
  cream: `${RADIALS},\n    ${BASE.cream}`,
  cool: `${RADIALS},\n    ${BASE.cool}`,
  rose: `${RADIALS},\n    ${BASE.rose}`,
};

export const DEFAULT_ACCENT: Accent = "#8f7cd4";
export const DEFAULT_WARMTH: Warmth = "cool";

export const STORAGE_KEYS = {
  accent: "pheme-accent",
  warmth: "pheme-warmth",
  ornaments: "pheme-ornaments",
} as const;
