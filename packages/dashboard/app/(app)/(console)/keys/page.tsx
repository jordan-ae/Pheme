import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listKeys, type ApiKeyMeta } from "@/lib/memory";
import { KeyManager } from "@/components/key-manager";

export const dynamic = "force-dynamic";

export default async function KeysPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let keys: ApiKeyMeta[] = [];
  let memError = false;
  try {
    keys = await listKeys(session.email);
  } catch {
    memError = true;
  }

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">API keys</span>
        <h1 className="page-title">Your API keys</h1>
        <p className="page-desc">
          Personal keys for connecting Claude Code, Cursor, Windsurf, and other agents to the Pheme
          memory server. Every entry written with a key is attributed to you.
        </p>
      </header>

      {memError ? (
        <div className="empty">
          <h3>Memory server unreachable</h3>
          <p>
            Couldn&apos;t load your keys. Check <span className="mono">MEMORY_SERVER_URL</span> and{" "}
            <span className="mono">MEMORY_API_KEY</span>.
          </p>
        </div>
      ) : (
        <KeyManager initialKeys={keys} email={session.email} />
      )}
    </>
  );
}
