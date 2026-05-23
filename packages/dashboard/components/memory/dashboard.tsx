"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import s from "./dashboard.module.css";
import { Icons } from "./icons";
import { List } from "./dash-list";
import { Detail, EntryFullView } from "./dash-detail";
import { OnboardingPanel, type OnboardingStatus } from "./onboarding-panel";
import { type DashEntry, TYPE_META } from "./format";
import type { EntryType } from "@/lib/memory";

const DENSITY_KEY = "pheme-memdash-density";

type Density = "compact" | "comfortable";
type TabKey = "authored" | "subscribed" | "mentioned" | "activity";
type TypeFilter = "all" | EntryType;

const TABS: { key: TabKey; label: string }[] = [
  { key: "authored", label: "Authored" },
  { key: "subscribed", label: "Subscribed" },
  { key: "mentioned", label: "Mentioned" },
  { key: "activity", label: "Activity" },
];

const TYPE_CYCLE: TypeFilter[] = ["all", "decision", "constraint", "tradeoff", "question"];

function viewTitle(view: string): string {
  if (view === "inbox") return "Inbox";
  if (view === "my") return "My memory";
  if (view === "agents") return "Agent activity";
  if (view.startsWith("project:")) {
    return view.slice("project:".length).replace(/^github\.com\//, "") || "Project";
  }
  if (view.startsWith("view:")) {
    return (
      {
        "recent-decisions": "Recent decisions",
        "open-questions": "Open questions",
        "pending-review": "Pending review",
        "agent-authored": "Agent-authored",
      }[view.slice("view:".length)] ?? "View"
    );
  }
  return "My memory";
}

function isBotAuthor(author: string | null): boolean {
  // mirrors format.isBot; kept inline to avoid an extra import churn
  if (!author) return false;
  const a = author.toLowerCase();
  return ["claude", "cursor", "codex", "copilot", "scribe", "agent", "[bot]", "gpt", " ai", "windsurf", "aider"].some(
    (h) => a.includes(h),
  );
}

function matchesView(e: DashEntry, view: string): boolean {
  if (view === "my") return true;
  if (view === "inbox") return e.status === "pending_review";
  if (view === "agents") return isBotAuthor(e.author);
  if (view.startsWith("project:")) return e.projectIdentifier === view.slice("project:".length);
  if (view.startsWith("view:")) {
    switch (view.slice("view:".length)) {
      case "recent-decisions":
        return e.type === "decision";
      case "open-questions":
        return e.type === "question";
      case "pending-review":
        return e.status === "pending_review";
      case "agent-authored":
        return isBotAuthor(e.author);
    }
  }
  return true;
}

export function MemoryDashboard({
  entries,
  user,
  serverError,
  onboarding,
}: {
  entries: DashEntry[];
  user: { login: string; name: string | null; email: string };
  serverError: boolean;
  /* Present only on a fresh workspace (no memory yet) — drives the inline
     first-run connect checklist that replaces the empty state. */
  onboarding?: OnboardingStatus;
}) {
  /* The active view lives in the URL (?view=…). Reading it from the live router
     (not a server prop) means the rail can switch views with window.history in
     place — the feed re-filters instantly off data already in the client, with no
     server round-trip. During SSR this reflects the request's searchParams, so the
     first paint is correct. */
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "my";

  const [density, setDensity] = useState<Density>("compact");
  const [tab, setTab] = useState<TabKey>("activity");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [group, setGroup] = useState<"status" | "type">("status");
  const [detailOpen, setDetailOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Full view is a client-side overlay rendered from the already-loaded entry —
  // instant, no navigation/fetch. (The /entries/[id] route stays for direct links.)
  const [expanded, setExpanded] = useState(false);

  // Density is a home-only display pref (theme is owned app-wide by the rail).
  useEffect(() => {
    try {
      const d = localStorage.getItem(DENSITY_KEY);
      if (d === "compact" || d === "comfortable") setDensity(d);
    } catch {}
  }, []);
  function applyDensity(next: Density) {
    setDensity(next);
    try {
      localStorage.setItem(DENSITY_KEY, next);
    } catch {}
  }

  const meIds = useMemo(
    () =>
      [user.login, user.name ?? "", user.email.split("@")[0]]
        .map((x) => x.toLowerCase())
        .filter(Boolean),
    [user],
  );
  const authoredByMe = (e: DashEntry) => {
    const a = (e.author ?? "").toLowerCase();
    return !!a && meIds.some((id) => a.includes(id) || id.includes(a));
  };

  const viewEntries = useMemo(() => entries.filter((e) => matchesView(e, view)), [entries, view]);

  const visible = useMemo(() => {
    let list = viewEntries;
    if (tab === "authored") list = list.filter(authoredByMe);
    else if (tab === "subscribed" || tab === "mentioned") list = [];
    if (typeFilter !== "all") list = list.filter((e) => e.type === typeFilter);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewEntries, tab, typeFilter, meIds]);

  // Keep a valid selection as the visible set changes.
  useEffect(() => {
    if (visible.length === 0) {
      setSelectedId(null);
    } else if (!visible.some((e) => e.id === selectedId)) {
      setSelectedId(visible[0].id);
    }
  }, [visible, selectedId]);

  const selected = visible.find((e) => e.id === selectedId) ?? null;
  const showDetail = detailOpen && !!selected;

  // The full-view overlay needs a selected entry; collapse it if the selection
  // clears (e.g. the view/filter changes out from under it).
  useEffect(() => {
    if (!selected) setExpanded(false);
  }, [selected]);

  // Escape closes the overlay (matches the in-bar Back control).
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const title = viewTitle(view);
  const pendingInView = viewEntries.filter((e) => e.status === "pending_review").length;
  const subtitle =
    `${viewEntries.length} ${viewEntries.length === 1 ? "entry" : "entries"}` +
    (pendingInView > 0 ? ` · ${pendingInView} pending review` : "");
  const scopeCrumb = view.startsWith("project:") ? "Projects" : "Workspace";

  function cycleType() {
    const i = TYPE_CYCLE.indexOf(typeFilter);
    setTypeFilter(TYPE_CYCLE[(i + 1) % TYPE_CYCLE.length]);
  }

  return (
    <div className={s.root} data-density={density}>
      <div className={`${s.app} ${showDetail ? s.hasDetail : ""}`}>
        <main className={s.main}>
          {/* Topbar */}
          <div className={s.topbar}>
            <div className={s.crumbs}>
              <span className={`${s.crumb} ${s.dim}`}>{scopeCrumb}</span>
              <span className={s.crumbSep}>/</span>
              <span className={s.crumb}>{title}</span>
            </div>
            <div className={s.topbarActions}>
              <button type="button" className={s.iconbtn} title="Ask Pheme">
                <Icons.Sparkle />
                <span className={s.lbl}>Ask Pheme</span>
              </button>
              <span className={s.vsep} />
              <button
                type="button"
                className={`${s.iconbtn} ${showDetail ? s.toggled : ""}`}
                title="Toggle details"
                onClick={() => setDetailOpen((o) => !o)}
              >
                <Icons.Layout />
              </button>
            </div>
          </div>

          {/* Subhead + tabs */}
          <div className={s.subhead}>
            <h1 className={s.pageTitle}>{title}</h1>
            <div className={s.pageSubtitle}>{subtitle}</div>
            <div className={s.tabsRow}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`${s.tab} ${tab === t.key ? s.active : ""}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter / group / display bar */}
          <div className={s.filterbar}>
            <button type="button" className={s.pill}>
              <Icons.Filter />
              <span>Filter</span>
            </button>
            <button
              type="button"
              className={`${s.pill} ${typeFilter !== "all" ? s.active : ""}`}
              onClick={cycleType}
              title="Cycle type filter"
            >
              <span className={s.dot} />
              <span>Type: {typeFilter === "all" ? "All" : TYPE_META[typeFilter].label}</span>
            </button>
            <button type="button" className={s.pill}>
              <Icons.Tag />
              <span>Tag</span>
            </button>
            <span className={s.spacer} />
            <button
              type="button"
              className={`${s.pill} ${group !== "status" ? s.active : ""}`}
              onClick={() => setGroup((g) => (g === "status" ? "type" : "status"))}
              title="Toggle grouping"
            >
              <Icons.Slider />
              <span>Group: {group}</span>
            </button>
            <button
              type="button"
              className={`${s.pill} ${density !== "compact" ? s.active : ""}`}
              onClick={() => applyDensity(density === "compact" ? "comfortable" : "compact")}
              title="Toggle density"
            >
              <Icons.Layout />
              <span>{density === "compact" ? "Compact" : "Cozy"}</span>
            </button>
          </div>

          {/* List / states */}
          {serverError ? (
            <div className={s.listState}>
              <h3>Memory server unreachable</h3>
              <p>
                Couldn&apos;t reach the memory server. Check <code>MEMORY_SERVER_URL</code> and{" "}
                <code>MEMORY_API_KEY</code>, then reload.
              </p>
            </div>
          ) : entries.length === 0 ? (
            onboarding ? (
              <OnboardingPanel status={onboarding} />
            ) : (
              <div className={s.listState}>
                <h3>No memory yet</h3>
                <p>
                  Once agents log decisions, constraints, and trade-offs against your enrolled
                  repositories, they&apos;ll stream in here.
                </p>
              </div>
            )
          ) : visible.length === 0 ? (
            <div className={s.listState}>
              <h3>Nothing here</h3>
              <p>
                {tab === "subscribed"
                  ? "Subscriptions aren't wired up yet — try the Activity tab."
                  : tab === "mentioned"
                    ? "No mentions yet — try the Activity tab."
                    : tab === "authored"
                      ? "You haven't authored entries in this view. Switch to Activity to see everyone's."
                      : "No entries match this view and filter."}
              </p>
            </div>
          ) : (
            <List entries={visible} group={group} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </main>

        {showDetail && selected && (
          <Detail
            entry={selected}
            onClose={() => setDetailOpen(false)}
            onExpand={() => setExpanded(true)}
          />
        )}
      </div>

      {/* Full-view overlay — rendered from the in-memory entry, so opening it is
          instant (no route navigation, no server re-fetch). */}
      {expanded && selected && (
        <div className={s.fullOverlay} role="dialog" aria-modal="true">
          <EntryFullView entry={selected} onClose={() => setExpanded(false)} />
        </div>
      )}

      {/* Floating command hint — suppressed under the full view so it doesn't
          float over the reading layout. */}
      {!expanded && (
        <div className={s.footbar}>
          <span className={s.kbd}>⌘</span>
          <span className={s.kbd}>K</span>
          <span>command menu</span>
          <span className={s.footDot}>·</span>
          <span className={s.kbd}>C</span>
          <span>new entry</span>
        </div>
      )}
    </div>
  );
}
