import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/");
  const { error } = await searchParams;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div className="card rise-in" style={{ maxWidth: 420, width: "100%", textAlign: "center", padding: 36 }}>
        <span className="sidebar-mark" style={{ margin: "0 auto 18px", width: 44, height: 44, fontSize: 24 }}>
          Φ
        </span>
        <h1 style={{ fontSize: 34 }}>Welcome to Pheme</h1>
        <p className="text-soft" style={{ marginTop: 12, fontSize: 15, lineHeight: 1.55 }}>
          The shared memory layer for your AI coding agents. Sign in to manage projects,
          browse decisions, and mint API keys.
        </p>

        {error && (
          <div className="callout callout-warn" style={{ marginTop: 20, textAlign: "left" }}>
            Sign-in didn&apos;t complete ({error}). Please try again.
          </div>
        )}

        <Link
          href="/api/auth/github"
          className="btn btn-primary"
          style={{ marginTop: 24, width: "100%" }}
        >
          <GitHubGlyph />
          Sign in with GitHub
        </Link>

        <p className="text-faint" style={{ marginTop: 18, fontSize: 12 }}>
          Pheme connects through a GitHub App. You choose which repositories it can access.
        </p>
      </div>
    </div>
  );
}

function GitHubGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
