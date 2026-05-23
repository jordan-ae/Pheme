"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./illustrations";

const NAV_LINKS = [
  { slug: "memory", href: "/#features", match: "/", label: "Memory" },
  { slug: "how", href: "/how-it-works", match: "/how-it-works", label: "How it works" },
  { slug: "agents", href: "/for-agents", match: "/for-agents", label: "For agents" },
  { slug: "pricing", href: "/pricing", match: "/pricing", label: "Pricing" },
  { slug: "docs", href: "/docs", match: "/docs", label: "Docs" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" aria-label="Pheme">
          <Wordmark />
        </Link>
        <nav className="nav-pill" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <Link key={l.slug} href={l.href} className={pathname === l.match ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href="#signin" className="btn btn-ghost" style={{ padding: "8px 14px" }}>
            Sign in
          </a>
          <Link href="/#join" className="btn btn-primary">
            Join waitlist
          </Link>
        </div>
      </div>
    </header>
  );
}
