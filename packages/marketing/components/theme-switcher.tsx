"use client";

import { useEffect, useState } from "react";
import {
  ACCENT_OPTIONS,
  ACCENT_SOFT,
  WARMTH_ATMOSPHERE,
  WARMTH_LABEL,
  STORAGE_KEYS,
  DEFAULT_ACCENT,
  DEFAULT_WARMTH,
  type Accent,
  type Warmth,
} from "@/lib/theme";

const WARMTHS: Warmth[] = ["cream", "cool", "rose"];

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [accent, setAccent] = useState<Accent>(DEFAULT_ACCENT);
  const [warmth, setWarmth] = useState<Warmth>(DEFAULT_WARMTH);
  const [ornaments, setOrnaments] = useState(true);

  // Sync UI from stored prefs (the pre-paint script already applied them).
  useEffect(() => {
    try {
      const a = localStorage.getItem(STORAGE_KEYS.accent) as Accent | null;
      const w = localStorage.getItem(STORAGE_KEYS.warmth) as Warmth | null;
      const o = localStorage.getItem(STORAGE_KEYS.ornaments);
      if (a && ACCENT_SOFT[a]) setAccent(a);
      if (w && WARMTH_ATMOSPHERE[w]) setWarmth(w);
      if (o === "off") setOrnaments(false);
    } catch {}
  }, []);

  function pickAccent(a: Accent) {
    setAccent(a);
    const r = document.documentElement;
    r.style.setProperty("--accent", a);
    r.style.setProperty("--accent-soft", ACCENT_SOFT[a]);
    try {
      localStorage.setItem(STORAGE_KEYS.accent, a);
    } catch {}
  }

  function pickWarmth(w: Warmth) {
    setWarmth(w);
    document.documentElement.style.setProperty("--atmosphere", WARMTH_ATMOSPHERE[w]);
    try {
      localStorage.setItem(STORAGE_KEYS.warmth, w);
    } catch {}
  }

  function toggleOrnaments(on: boolean) {
    setOrnaments(on);
    const r = document.documentElement;
    if (on) r.removeAttribute("data-ornaments");
    else r.setAttribute("data-ornaments", "off");
    try {
      localStorage.setItem(STORAGE_KEYS.ornaments, on ? "on" : "off");
    } catch {}
  }

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 2147483646 }}>
      {open ? (
        <div
          style={{
            width: 248,
            background: "rgba(250,249,247,0.82)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            backdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.6)",
            borderRadius: 14,
            boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset, 0 12px 40px rgba(28,27,61,0.22)",
            color: "var(--ink)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "11px 10px 11px 16px",
            }}
          >
            <b style={{ fontFamily: "var(--font-serif)", fontSize: 17 }}>Theme</b>
            <button
              type="button"
              aria-label="Close theme switcher"
              onClick={() => setOpen(false)}
              style={{
                border: 0,
                background: "transparent",
                color: "var(--ink-3)",
                width: 24,
                height: 24,
                borderRadius: 7,
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Brand accent">
              <div style={{ display: "flex", gap: 8 }}>
                {ACCENT_OPTIONS.map((o) => {
                  const on = o.value === accent;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      title={o.label}
                      aria-label={o.label}
                      aria-pressed={on}
                      onClick={() => pickAccent(o.value)}
                      style={{
                        flex: 1,
                        height: 30,
                        borderRadius: 8,
                        border: "0",
                        background: o.value,
                        cursor: "pointer",
                        boxShadow: on
                          ? "0 0 0 2px var(--ink), 0 2px 6px rgba(28,27,61,0.2)"
                          : "0 0 0 1px rgba(28,27,61,0.14)",
                        transition: "box-shadow 0.12s, transform 0.12s",
                      }}
                    />
                  );
                })}
              </div>
            </Field>

            <Field label="Atmosphere">
              <div
                style={{
                  display: "flex",
                  padding: 3,
                  borderRadius: 9,
                  background: "rgba(28,27,61,0.07)",
                  gap: 2,
                }}
              >
                {WARMTHS.map((w) => {
                  const on = w === warmth;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => pickWarmth(w)}
                      style={{
                        flex: 1,
                        border: 0,
                        borderRadius: 7,
                        padding: "6px 4px",
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "var(--font-sans)",
                        color: on ? "var(--ink)" : "var(--ink-3)",
                        background: on ? "rgba(255,255,255,0.92)" : "transparent",
                        boxShadow: on ? "0 1px 2px rgba(28,27,61,0.14)" : "none",
                        cursor: "pointer",
                      }}
                    >
                      {WARMTH_LABEL[w]}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Hero ornaments" inline>
              <button
                type="button"
                role="switch"
                aria-checked={ornaments}
                aria-label="Toggle hero ornaments"
                onClick={() => toggleOrnaments(!ornaments)}
                style={{
                  position: "relative",
                  width: 34,
                  height: 19,
                  border: 0,
                  borderRadius: 999,
                  background: ornaments ? "var(--accent)" : "rgba(28,27,61,0.2)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  flex: "0 0 auto",
                }}
              >
                <i
                  style={{
                    position: "absolute",
                    top: 2,
                    left: 2,
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                    transform: ornaments ? "translateX(15px)" : "none",
                    transition: "transform 0.15s",
                  }}
                />
              </button>
            </Field>
          </div>
        </div>
      ) : (
        <button
          type="button"
          aria-label="Open theme switcher"
          onClick={() => setOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            height: 38,
            padding: "0 14px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.6)",
            background: "rgba(250,249,247,0.82)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            backdropFilter: "blur(20px) saturate(160%)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset, 0 10px 30px -10px rgba(28,27,61,0.3)",
            color: "var(--ink-2)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: 999, background: accent }} />
          Theme
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  inline = false,
}: {
  label: string;
  children: React.ReactNode;
  inline?: boolean;
}) {
  return (
    <div
      style={
        inline
          ? { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }
          : { display: "flex", flexDirection: "column", gap: 7 }
      }
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
