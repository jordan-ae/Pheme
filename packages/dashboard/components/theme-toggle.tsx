"use client";

import { useEffect, useState } from "react";
import {
  ACCENT_OPTIONS,
  ACCENT_SOFT,
  DEFAULT_ACCENT,
  DEFAULT_MODE,
  STORAGE_KEYS,
  type Accent,
  type Mode,
} from "@/lib/theme";

/* Light/dark mode is the headline control; accent picker matches the marketing
   switcher. Both persist to localStorage and are re-applied pre-paint in layout. */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  const [accent, setAccent] = useState<Accent>(DEFAULT_ACCENT);

  useEffect(() => {
    try {
      const m = localStorage.getItem(STORAGE_KEYS.mode) as Mode | null;
      const a = localStorage.getItem(STORAGE_KEYS.accent) as Accent | null;
      if (m === "dark" || m === "light") setMode(m);
      if (a && ACCENT_SOFT[a]) setAccent(a);
    } catch {}
  }, []);

  function applyMode(next: Mode) {
    setMode(next);
    const r = document.documentElement;
    // Dark is the default (no attribute); only light sets data-theme.
    if (next === "light") r.setAttribute("data-theme", "light");
    else r.removeAttribute("data-theme");
    try {
      localStorage.setItem(STORAGE_KEYS.mode, next);
    } catch {}
  }

  function applyAccent(a: Accent) {
    setAccent(a);
    const r = document.documentElement;
    r.style.setProperty("--accent", a);
    r.style.setProperty("--accent-soft", ACCENT_SOFT[a]);
    try {
      localStorage.setItem(STORAGE_KEYS.accent, a);
    } catch {}
  }

  const isDark = mode === "dark";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 10 }}>
        <span className="eyebrow" style={{ fontSize: 10 }}>
          {isDark ? "Dark" : "Light"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label="Toggle dark mode"
          className="switch"
          onClick={() => applyMode(isDark ? "light" : "dark")}
        >
          <i>{isDark ? "🌙" : "☀️"}</i>
        </button>
      </div>
      <div className="row" style={{ gap: 8 }}>
        {ACCENT_OPTIONS.map((o) => {
          const on = o.value === accent;
          return (
            <button
              key={o.value}
              type="button"
              title={o.label}
              aria-label={o.label}
              aria-pressed={on}
              onClick={() => applyAccent(o.value)}
              style={{
                flex: 1,
                height: 22,
                borderRadius: 7,
                border: 0,
                background: o.value,
                cursor: "pointer",
                boxShadow: on
                  ? "0 0 0 2px var(--ink), 0 2px 6px rgba(0,0,0,0.2)"
                  : "0 0 0 1px var(--line-strong)",
                transition: "box-shadow 0.12s",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
