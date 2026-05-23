"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Icons } from "./memory/icons";
import { colorFor, personFor } from "./memory/format";
import { DEFAULT_MODE, STORAGE_KEYS, type Mode } from "@/lib/theme";

/* The single app-wide navigation rail — the SAME sidebar on the home dashboard
   and every console page. Collapsible (icon-only when collapsed); the collapse
   state is owned by AppShell. Navigation-driven: the home's "view" lives in the
   URL (`/?view=...`), so the home reads it server-side and the rail just links. */

export interface DashProject {
  id: string;
  identifier: string;
  name: string | null;
}

export interface DashTeam {
  id: string;
  slug: string;
  name: string;
}

export interface AppUser {
  name: string | null;
  login: string;
  email: string;
  avatarUrl: string | null;
}

const VIEWS: { slug: string; label: string; icon: keyof typeof Icons }[] = [
  { slug: "recent-decisions", label: "Recent decisions", icon: "Bookmark" },
  { slug: "open-questions", label: "Open questions", icon: "Bookmark" },
  { slug: "pending-review", label: "Pending review", icon: "Bookmark" },
  { slug: "agent-authored", label: "Agent-authored", icon: "Sparkle" },
];

function projectLabel(p: DashProject): string {
  return p.name ?? p.identifier.replace(/^github\.com\//, "");
}

const viewHref = (key: string) => (key === "my" ? "/" : `/?view=${encodeURIComponent(key)}`);

export function AppSidebar({
  user,
  projects,
  teams = [],
  collapsed,
  onToggle,
}: {
  user: AppUser;
  projects: DashProject[];
  teams?: DashTeam[];
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const [groupsCollapsed, setGroupsCollapsed] = useState<Record<string, boolean>>({});
  const toggleGroup = (k: string) => setGroupsCollapsed((c) => ({ ...c, [k]: !c[k] }));

  const onHome = pathname === "/";
  const currentView = onHome ? params.get("view") || "my" : "";
  const viewActive = (key: string) => onHome && currentView === key;
  const routeActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const [mode, setMode] = useState<Mode>(DEFAULT_MODE);
  useEffect(() => {
    try {
      const m = localStorage.getItem(STORAGE_KEYS.mode) as Mode | null;
      if (m === "light" || m === "dark") setMode(m);
    } catch {}
  }, []);
  function toggleMode() {
    const next: Mode = mode === "dark" ? "light" : "dark";
    setMode(next);
    const r = document.documentElement;
    if (next === "light") r.setAttribute("data-theme", "light");
    else r.removeAttribute("data-theme");
    try {
      localStorage.setItem(STORAGE_KEYS.mode, next);
    } catch {}
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const me = personFor(user.name ?? user.login);

  return (
    <aside className="app-rail">
      <div className="rail-top">
        <Link href="/" className="rail-ws" title="Pheme — home">
          <span className="rail-mark">Φ</span>
          <span className="rail-ws-name">Pheme Labs</span>
        </Link>
        <button
          type="button"
          className="rail-icon-btn"
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icons.Panel />
        </button>
      </div>

      <div className="rail-section">
        <Link href={viewHref("inbox")} title="Inbox" className={`rail-item${viewActive("inbox") ? " active" : ""}`}>
          <span className="ic">
            <Icons.Inbox />
          </span>
          <span className="label">Inbox</span>
        </Link>
        <Link href={viewHref("my")} title="My memory" className={`rail-item${viewActive("my") ? " active" : ""}`}>
          <span className="ic">
            <Icons.Brain />
          </span>
          <span className="label">My memory</span>
        </Link>
        <Link href={viewHref("agents")} title="Agent activity" className={`rail-item${viewActive("agents") ? " active" : ""}`}>
          <span className="ic">
            <Icons.Sparkle />
          </span>
          <span className="label">Agent activity</span>
        </Link>
      </div>

      <div className="rail-section">
        <div className={`rail-group${groupsCollapsed.projects ? " collapsed" : ""}`}>
          <button type="button" className="rail-group-toggle" onClick={() => toggleGroup("projects")}>
            <Icons.Caret className="caret" />
            <span className="label">Projects</span>
          </button>
          <span className="rail-group-actions">
            <Link href="/connect" className="rail-group-act" title="Enroll a repository">
              <Icons.Plus />
            </Link>
            <Link href="/projects" className="rail-group-act" title="Manage repositories">
              <Icons.Dots />
            </Link>
          </span>
        </div>
        {!groupsCollapsed.projects &&
          projects.map((p) => {
            const key = `project:${p.identifier}`;
            const label = projectLabel(p);
            return (
              <Link
                key={p.id}
                href={viewHref(key)}
                title={label}
                className={`rail-item${viewActive(key) ? " active" : ""}`}
              >
                <span className="rail-dot" style={{ background: colorFor(p.identifier) }}>
                  {label[0]?.toUpperCase() ?? "·"}
                </span>
                <span className="label">{label}</span>
              </Link>
            );
          })}
        {!groupsCollapsed.projects && projects.length === 0 && (
          <Link href="/connect" title="Enroll a repository" className="rail-item">
            <span className="ic">
              <Icons.Plus />
            </span>
            <span className="label">Enroll a repository</span>
          </Link>
        )}
      </div>

      <div className="rail-section">
        <div className={`rail-group${groupsCollapsed.views ? " collapsed" : ""}`}>
          <button type="button" className="rail-group-toggle" onClick={() => toggleGroup("views")}>
            <Icons.Caret className="caret" />
            <span className="label">Views</span>
          </button>
        </div>
        {!groupsCollapsed.views &&
          VIEWS.map((v) => {
            const Icon = Icons[v.icon];
            const key = `view:${v.slug}`;
            return (
              <Link
                key={v.slug}
                href={viewHref(key)}
                title={v.label}
                className={`rail-item${viewActive(key) ? " active" : ""}`}
              >
                <span className="ic">
                  <Icon />
                </span>
                <span className="label">{v.label}</span>
              </Link>
            );
          })}
      </div>

      <div className="rail-section">
        <div className={`rail-group${groupsCollapsed.teams ? " collapsed" : ""}`}>
          <button type="button" className="rail-group-toggle" onClick={() => toggleGroup("teams")}>
            <Icons.Caret className="caret" />
            <span className="label">Teams</span>
          </button>
        </div>
        {!groupsCollapsed.teams &&
          teams.map((t) => {
            const key = `team:${t.slug}`;
            return (
              <Link key={t.id} href={viewHref(key)} title={t.name} className={`rail-item${viewActive(key) ? " active" : ""}`}>
                <span className="rail-dot" style={{ background: colorFor(t.slug) }}>
                  {t.name[0]?.toUpperCase() ?? "·"}
                </span>
                <span className="label">{t.name}</span>
              </Link>
            );
          })}
        {!groupsCollapsed.teams && teams.length === 0 && (
          <div className="rail-item rail-item-empty" title="No teams yet">
            <span className="ic">
              <Icons.Users />
            </span>
            <span className="label">No teams yet</span>
          </div>
        )}
      </div>

      <div className="rail-section rail-section-account">
        <Link href="/connect" title="GitHub App" className={`rail-item${routeActive("/connect") ? " active" : ""}`}>
          <span className="ic">
            <Icons.Github />
          </span>
          <span className="label">GitHub App</span>
        </Link>
        <Link href="/keys" title="Settings & keys" className={`rail-item${routeActive("/keys") ? " active" : ""}`}>
          <span className="ic">
            <Icons.Settings />
          </span>
          <span className="label">Settings &amp; keys</span>
        </Link>
        <button type="button" className="rail-item" onClick={signOut} title="Sign out">
          <span className="ic">
            <Icons.Backlink />
          </span>
          <span className="label">Sign out</span>
        </button>
      </div>

      <div className="rail-foot">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            width={22}
            height={22}
            title={user.name ?? user.login}
            style={{ borderRadius: 6, border: "1px solid var(--line-strong)", flex: "0 0 auto" }}
          />
        ) : (
          <span
            className="rail-dot"
            title={user.name ?? user.login}
            style={{ background: me.color, width: 22, height: 22, borderRadius: 6, fontSize: 10 }}
          >
            {me.initials}
          </span>
        )}
        <div className="rail-foot-meta" style={{ minWidth: 0, flex: 1 }}>
          <div className="name">{user.name ?? user.login}</div>
          <div className="sub">online</div>
        </div>
        <button
          type="button"
          className="rail-icon-btn"
          onClick={toggleMode}
          title={mode === "dark" ? "Switch to light" : "Switch to dark"}
          aria-label="Toggle theme"
        >
          {mode === "dark" ? <Icons.Sun /> : <Icons.Moon />}
        </button>
      </div>
    </aside>
  );
}
