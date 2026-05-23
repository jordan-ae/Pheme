import { resolveServerConfig } from "../lib/env.js";
import { createKey } from "../lib/http.js";

// `memory key:create --user <email>` — mint a per-user API key (AD-07 v2).
// Authenticates with the shared admin key (resolveServerConfig); the server
// returns the raw key exactly once, so we print it with storage instructions.
export async function keyCreate(flags: Record<string, string | undefined>): Promise<void> {
  const cfg = resolveServerConfig(flags); // shared MEMORY_API_KEY = admin
  const userEmail = flags.user;
  if (!userEmail) {
    throw new Error("Pass --user <email> — the developer this key identifies.");
  }
  const label = flags.label;

  const { apiKey } = await createKey(cfg, userEmail, label);

  console.log(`✓ Minted a personal key for ${userEmail}`);
  console.log(`  server: ${cfg.serverUrl}`);
  console.log(`\n  ${apiKey}\n`);
  console.log("This key is shown ONCE — store it now (a password manager is fine).");
  console.log("Use it as MEMORY_API_KEY in your agent's MCP config in place of the shared key,");
  console.log("then restart your agents. Everything you log will be attributed to you.");
}
