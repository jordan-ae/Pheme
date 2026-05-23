import { resolveServerConfig } from "../lib/env.js";
import { canonicalIdentifier, getRemoteUrl } from "../lib/git.js";
import { lookupProject } from "../lib/http.js";

// `memory status` — report whether the current repo is enrolled.
export async function status(flags: Record<string, string | undefined>): Promise<void> {
  const cfg = resolveServerConfig(flags);
  const remote = flags.identifier ?? getRemoteUrl();
  const identifier = canonicalIdentifier(remote);

  const { enrolled, project } = await lookupProject(cfg, identifier);

  console.log(`repo:     ${identifier}`);
  console.log(`server:   ${cfg.serverUrl}`);
  console.log(`enrolled: ${enrolled ? "yes" : "no"}`);
  if (enrolled && project) {
    console.log(`  name:        ${project.name ?? "—"}`);
    console.log(`  enrolled by: ${project.enrolledBy ?? "—"}`);
    console.log(`  enrolled at: ${project.enrolledAt}`);
  } else {
    console.log(`\nRun 'memory init' to enroll this repo.`);
  }
}
