import { basename } from "node:path";
import { resolveServerConfig } from "../lib/env.js";
import { canonicalIdentifier, getRemoteUrl } from "../lib/git.js";
import { registerProject } from "../lib/http.js";

// `memory init` — enroll the current repo on the memory server (SRS §4.1).
// Reads the git remote URL, canonicalises it, and registers it. Nothing is
// written to the repo: enrollment is purely server-side.
export async function init(flags: Record<string, string | undefined>): Promise<void> {
  const cfg = resolveServerConfig(flags);
  const remote = flags.identifier ?? getRemoteUrl();
  const identifier = canonicalIdentifier(remote);
  const name = flags.name ?? (basename(identifier) || identifier);
  const enrolledBy = flags["enrolled-by"] ?? process.env.USER ?? undefined;

  const result = await registerProject(cfg, identifier, name, enrolledBy);

  if (result.created) {
    console.log(`✓ Enrolled ${identifier}`);
  } else {
    console.log(`✓ ${identifier} was already enrolled (re-activated)`);
  }
  console.log(`  server: ${cfg.serverUrl}`);
  console.log(`  Agents working in this repo now receive scoped project memory.`);
  console.log(`  Next: run 'memory onboard' once per machine to wire up your agents.`);
}
