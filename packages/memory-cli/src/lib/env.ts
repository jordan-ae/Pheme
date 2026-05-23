import { config } from "dotenv";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The CLI runs in arbitrary repos, not just this monorepo, so we load a .env from
// the *current working directory* if one happens to be there (harmless if not),
// then fall back to the real environment. Flags override both.
const cwdEnv = join(process.cwd(), ".env");
if (existsSync(cwdEnv)) config({ path: cwdEnv });

export interface ServerConfig {
  serverUrl: string;
  apiKey: string;
}

export function resolveServerConfig(flags: Record<string, string | undefined>): ServerConfig {
  const serverUrl = (
    flags.server ??
    process.env.MEMORY_SERVER_URL ??
    "http://localhost:4000"
  ).replace(/\/$/, "");

  const apiKey = flags.key ?? process.env.MEMORY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No API key. Pass --key <key> or set MEMORY_API_KEY (the shared team key from .env, per AD-07).",
    );
  }
  return { serverUrl, apiKey };
}
