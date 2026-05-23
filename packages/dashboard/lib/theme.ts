/* ----------------------------------------------------------------
   Dashboard theme tokens. Mirrors the marketing switcher's accent
   model (packages/marketing/lib/theme.ts) and adds a light/dark MODE
   toggle — the dashboard's headline theming control. Both the toggle
   UI and the pre-paint inline script in app/layout.tsx read these as
   the single source of truth, so stored prefs apply before first paint
   (no flash).
   ---------------------------------------------------------------- */

export type Mode = "light" | "dark";
export type Accent = "#a994e8" | "#8ccab0" | "#9cc0e6" | "#ecc96f" | "#e9a6ad";

/* Accent swatches mirror the dense dashboard's Tweaks palette. */
export const ACCENT_OPTIONS: { value: Accent; label: string }[] = [
  { value: "#a994e8", label: "Lavender" },
  { value: "#8ccab0", label: "Mint" },
  { value: "#9cc0e6", label: "Sky" },
  { value: "#ecc96f", label: "Butter" },
  { value: "#e9a6ad", label: "Rose" },
];

/* Accent hex → soft tint (lowercase keys). */
export const ACCENT_SOFT: Record<string, string> = {
  "#a994e8": "rgba(169,148,232,0.16)",
  "#8ccab0": "rgba(140,202,176,0.16)",
  "#9cc0e6": "rgba(156,192,230,0.16)",
  "#ecc96f": "rgba(236,201,111,0.16)",
  "#e9a6ad": "rgba(233,166,173,0.16)",
};

/* Dark is the default direction; the dense dashboard ships dark. */
export const DEFAULT_MODE: Mode = "dark";
export const DEFAULT_ACCENT: Accent = "#a994e8";

export const STORAGE_KEYS = {
  mode: "pheme-dash-mode",
  accent: "pheme-dash-accent",
} as const;
