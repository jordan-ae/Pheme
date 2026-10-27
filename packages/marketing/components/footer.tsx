import Link from "next/link";
import { Wordmark } from "./illustrations";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-cols">
          <div>
            <Wordmark />
            <p style={{ marginTop: 14, color: "var(--ink-2)", fontSize: 14, maxWidth: 280, lineHeight: 1.55 }}>
              The shared memory layer for AI coding agents. Named for the messenger goddess.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <a href="https://github.com" className="mini-chip" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="#" className="mini-chip">
                Discord
              </a>
              <Link href="/changelog" className="mini-chip">
                /changelog
              </Link>
            </div>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Product</div>
            <Link href="/#features">Memory layer</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/for-agents">For agents</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/changelog">Changelog</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Docs</div>
            <Link href="/docs">Connect your agent</Link>
            <Link href="/docs#mcp">MCP server</Link>
            <Link href="/docs#cli">CLI</Link>
            <Link href="/docs#schemas">Schemas</Link>
            <Link href="/docs#templates">Templates</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <a href="#">Manifesto</a>
            <a href="#">Blog</a>
            <a href="#">Customers</a>
            <a href="#">Careers</a>
            <a href="mailto:hi@phemesh.dev">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Pheme Labs</span>
          <span>Pheme — Φήμη — the messenger</span>
        </div>
      </div>
    </footer>
  );
}
