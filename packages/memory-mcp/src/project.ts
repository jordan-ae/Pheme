import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";

// The MCP server is configured once per machine (via `memory onboard`) and spawned
// by the host with cwd set to the open workspace. So the project must be resolved
// at runtime from *this* repo — not baked into the shared config — or every repo on
// the machine would share one project. Resolution order:
//   1. MEMORY_PROJECT  — explicit override; the only option for a repo with no remote.
//   2. the canonicalised `origin` git remote of the cwd.
// A repo without a remote can set MEMORY_PROJECT in its own .env (loaded below).

const cwdEnv = join(process.cwd(), ".env");
if (existsSync(cwdEnv)) config({ path: cwdEnv });

// Must stay byte-for-byte in sync with memory-cli/src/lib/git.ts so the wrapper
// sends the exact identifier `memory init` registered.
//   git@github.com:org/repo.git       -> github.com/org/repo
//   https://github.com/org/repo.git   -> github.com/org/repo
function canonicalIdentifier(remoteUrl: string): string {
  let s = remoteUrl.trim();
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, ""); // strip scheme
  s = s.replace(/^[^@/]+@/, ""); // strip user@
  s = s.replace(":", "/"); // scp-style host:path -> host/path
  s = s.replace(/\.git$/i, ""); // strip trailing .git
  s = s.replace(/\/+$/, ""); // strip trailing slash
  return s.toLowerCase();
}

function gitRemoteIdentifier(): string | undefined {
  try {
    const raw = execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return raw ? canonicalIdentifier(raw) : undefined;
  } catch {
    return undefined;
  }
}

// Resolved once at process start (cwd is fixed for the life of the MCP server).
export const PROJECT_IDENTIFIER: string | undefined =
  process.env.MEMORY_PROJECT?.trim() || gitRemoteIdentifier();
