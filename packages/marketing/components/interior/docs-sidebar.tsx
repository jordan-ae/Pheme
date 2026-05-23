"use client";

import { useEffect, useState } from "react";

const DOC_SECTIONS = [
  {
    id: "quickstart",
    title: "Quickstart",
    items: [
      { id: "install", label: "Install" },
      { id: "first-run", label: "First run" },
      { id: "first-log", label: "Your first memory" },
    ],
  },
  {
    id: "mcp",
    title: "MCP server",
    items: [
      { id: "tools", label: "The four tools" },
      { id: "transports", label: "Transports" },
    ],
  },
  { id: "cli", title: "CLI", items: [{ id: "cli-cmds", label: "Commands" }] },
  { id: "schemas", title: "Schemas", items: [{ id: "entry", label: "Entry" }, { id: "context", label: "Context bundle" }] },
  { id: "self-host", title: "Self-host", items: [{ id: "docker", label: "Docker" }, { id: "supabase", label: "Supabase" }] },
  { id: "templates", title: "Templates", items: [{ id: "claude-md", label: "CLAUDE.md" }] },
];

export function DocsSidebar() {
  const [active, setActive] = useState("quickstart");

  useEffect(() => {
    const all = DOC_SECTIONS.flatMap((s) => [s.id, ...s.items.map((i) => i.id)]);
    const onScroll = () => {
      let cur = all[0];
      for (const id of all) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) cur = id;
      }
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <aside style={{ position: "sticky", top: 100, alignSelf: "flex-start" }}>
      <div
        style={{
          padding: 18,
          background: "rgba(255,255,255,0.78)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          maxHeight: "calc(100vh - 140px)",
          overflowY: "auto",
        }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 12 }}>
          On this page
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
          {DOC_SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                style={{
                  display: "block",
                  padding: "6px 10px",
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: active === s.id ? "var(--ink)" : "var(--ink-2)",
                  background: active === s.id ? "var(--accent-soft)" : "transparent",
                }}
              >
                {s.title}
              </a>
              {s.items.length > 0 && (
                <ul style={{ margin: "2px 0 6px 8px", padding: 0, listStyle: "none", borderLeft: "1px solid var(--line)" }}>
                  {s.items.map((i) => (
                    <li key={i.id}>
                      <a
                        href={`#${i.id}`}
                        style={{
                          display: "block",
                          padding: "4px 10px",
                          fontSize: 12.5,
                          color: active === i.id ? "var(--accent)" : "var(--ink-3)",
                          fontWeight: active === i.id ? 600 : 400,
                        }}
                      >
                        {i.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
