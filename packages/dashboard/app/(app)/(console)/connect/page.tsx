import Link from "next/link";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Connect GitHub</span>
        <h1 className="page-title">Give Pheme access to your repos</h1>
        <p className="page-desc">
          Pheme connects through a GitHub App. You choose exactly which repositories it can see —
          and you can change that any time from GitHub.
        </p>
      </header>

      {error === "install_failed" && (
        <div className="callout callout-warn" style={{ marginBottom: 22 }}>
          Something went wrong finishing the installation. Please try again.
        </div>
      )}

      <div className="card" style={{ maxWidth: 640 }}>
        <ol style={{ margin: 0, padding: "0 0 0 20px", display: "grid", gap: 16 }}>
          <li className="text-soft">
            <strong style={{ color: "var(--ink)" }}>Install the Pheme App</strong> on the org or
            account that owns the repositories you want to track.
          </li>
          <li className="text-soft">
            <strong style={{ color: "var(--ink)" }}>Pick the repositories</strong> it can access.
            Pheme only ever reads what you grant.
          </li>
          <li className="text-soft">
            <strong style={{ color: "var(--ink)" }}>Enroll a project</strong> from the Projects page
            to begin collecting its memory.
          </li>
        </ol>

        <div className="divider" />

        <Link href="/api/github/install" className="btn btn-primary">
          Install the Pheme GitHub App
        </Link>
      </div>

      <div className="callout" style={{ marginTop: 22, maxWidth: 640 }}>
        Content access (reading code and pull requests) is granted by the App so future features can
        use it, but Pheme does not act on your PRs today — that surface is still being designed.
      </div>
    </>
  );
}
