"use client";

import { Suspense, useEffect, useState } from "react";
import { AppSidebar, type AppUser, type DashProject, type DashTeam } from "./app-sidebar";

const COLLAPSE_KEY = "pheme-rail-collapsed";

/* Owns the shared rail's collapse state for the whole app. Collapsed by default
   (icon-only); the choice is persisted. Renders the dense rail beside the page
   content (server children passed through). */
export function AppShell({
  user,
  projects,
  teams = [],
  children,
}: {
  user: AppUser;
  projects: DashProject[];
  teams?: DashTeam[];
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem(COLLAPSE_KEY);
      if (v === "false") setCollapsed(false);
      else if (v === "true") setCollapsed(true);
    } catch {}
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, String(next));
      } catch {}
      return next;
    });
  }

  return (
    <div className="appshell" data-collapsed={collapsed ? "true" : "false"}>
      <Suspense fallback={<aside className="app-rail" />}>
        <AppSidebar user={user} projects={projects} teams={teams} collapsed={collapsed} onToggle={toggle} />
      </Suspense>
      <div className="appshell-main">{children}</div>
    </div>
  );
}
