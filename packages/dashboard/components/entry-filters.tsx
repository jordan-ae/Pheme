"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

const TYPE_TABS = [
  { value: "", label: "All" },
  { value: "decision", label: "Decisions" },
  { value: "constraint", label: "Constraints" },
  { value: "tradeoff", label: "Trade-offs" },
  { value: "question", label: "Questions" },
];

/* URL-driven filters for the project detail view: a type tab strip, a semantic
   search box, and a history toggle. State lives in the query string so it's
   shareable and the server component re-renders with the right data. */
export function EntryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const activeType = params.get("type") ?? "";
  const history = params.get("history") === "1";

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setParam("q", q.trim() || null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
      <form className="search-row" onSubmit={submitSearch}>
        <input
          className="input"
          placeholder="Search this project's memory by meaning…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        {params.get("q") && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setQ("");
              setParam("q", null);
            }}
          >
            Clear
          </button>
        )}
      </form>

      {!params.get("q") && (
        <div className="row" style={{ gap: 14, flexWrap: "wrap" }}>
          <div className="tabs">
            {TYPE_TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`tab${activeType === t.value ? " active" : ""}`}
                onClick={() => setParam("type", t.value || null)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={history}
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={() => setParam("history", history ? null : "1")}
          >
            {history ? "✓ Showing history" : "Show history"}
          </button>
        </div>
      )}
    </div>
  );
}
