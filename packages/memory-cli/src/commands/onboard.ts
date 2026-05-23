import { homedir } from "node:os";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { resolveServerConfig } from "../lib/env.js";

// `memory onboard` — the one-time machine setup (SRS §3.2 ①). Writes the
// phemesh-memory MCP server into each supported agent's config so that every
// agent on this machine connects automatically. Merges into existing config
// (never clobbers); idempotent.

type Kind = "json" | "toml";

interface Agent {
  name: string;
  kind: Kind;
  detect: string; // dir whose presence means the agent is installed
  file: string; // config file to merge into
  topKey?: string; // JSON: where MCP servers live ("mcpServers" | "mcp")
  shape?: "standard" | "opencode"; // JSON entry shape
  note?: string;
}

const SERVER_NAME = "phemesh-memory";
const MCP_PACKAGE = "@phemesh/memory-mcp";

// The launch command written into each agent config. The published default runs
// the MCP server straight from npm (`npx -y @phemesh/memory-mcp`), so it works on
// any machine with no local-path assumptions. For local development, point
// --mcp-entry at a built dist/index.js and we launch it with `node` instead.
type Launcher = { command: string; args: string[]; localEntry?: string };

function resolveLauncher(flags: Record<string, string | undefined>): Launcher {
  const override = flags["mcp-entry"];
  if (override) {
    const entry = resolve(override);
    return { command: "node", args: [entry], localEntry: entry };
  }
  return { command: "npx", args: ["-y", MCP_PACKAGE] };
}

export async function onboard(flags: Record<string, string | undefined>): Promise<void> {
  const cfg = resolveServerConfig(flags);
  const launcher = resolveLauncher(flags);
  const force = flags.all === "true" || flags.force === "true";
  const env = { MEMORY_SERVER_URL: cfg.serverUrl, MEMORY_API_KEY: cfg.apiKey };
  const home = homedir();

  const agents: Agent[] = [
    {
      name: "Claude Code",
      kind: "json",
      detect: join(home, ".claude"),
      file: join(home, ".claude.json"), // user-scope mcpServers live here in current Claude Code
      topKey: "mcpServers",
      shape: "standard",
    },
    {
      name: "Cursor",
      kind: "json",
      detect: join(home, ".cursor"),
      file: join(home, ".cursor", "mcp.json"),
      topKey: "mcpServers",
      shape: "standard",
    },
    {
      name: "OpenCode",
      kind: "json",
      detect: join(home, ".config", "opencode"),
      file: join(home, ".config", "opencode", "opencode.json"),
      topKey: "mcp",
      shape: "opencode",
    },
    {
      name: "OpenAI Codex",
      kind: "toml",
      detect: join(home, ".codex"),
      file: join(home, ".codex", "config.toml"),
      note: "team-wide enforcement is configured in the Codex dashboard (admin/policy-based)",
    },
    {
      name: "Google Antigravity",
      kind: "json",
      detect: join(home, ".antigravity"),
      file: join(home, ".antigravity", "mcp.json"),
      topKey: "mcpServers",
      shape: "standard",
      note: "best-effort config path — verify against your Antigravity version",
    },
  ];

  const standardEntry = { command: launcher.command, args: launcher.args, env };
  const opencodeEntry = {
    type: "local",
    command: [launcher.command, ...launcher.args],
    enabled: true,
    environment: env,
  };

  console.log(`Onboarding agents on this machine`);
  console.log(`  server:    ${cfg.serverUrl}`);
  console.log(`  mcp:       ${launcher.command} ${launcher.args.join(" ")}`);
  if (launcher.localEntry && !existsSync(launcher.localEntry)) {
    console.log(`  ⚠ not built yet — run: pnpm --filter @phemesh/memory-mcp build`);
  }
  console.log("");

  for (const a of agents) {
    const installed = existsSync(a.detect);
    if (!installed && !force) {
      console.log(`  – ${a.name}: not detected (skipped; use --all to write anyway)`);
      continue;
    }
    try {
      if (a.kind === "json") {
        const entry = a.shape === "opencode" ? opencodeEntry : standardEntry;
        mergeJson(a.file, a.topKey ?? "mcpServers", SERVER_NAME, entry);
      } else {
        const result = mergeCodexToml(a.file, SERVER_NAME, launcher, env);
        if (result === "skipped") {
          console.log(`  ✓ ${a.name}: already configured (${a.file})${a.note ? ` — ${a.note}` : ""}`);
          continue;
        }
      }
      console.log(`  ✓ ${a.name}: ${a.file}${a.note ? ` — ${a.note}` : ""}`);
    } catch (err) {
      console.log(`  ✗ ${a.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`\nDone. Restart any running agents so they pick up the new MCP server.`);
}

function mergeJson(
  filePath: string,
  topKey: string,
  serverName: string,
  entry: Record<string, unknown>,
): void {
  mkdirSync(dirname(filePath), { recursive: true });
  let doc: Record<string, unknown> = {};
  if (existsSync(filePath)) {
    const raw = readFileSync(filePath, "utf8").trim();
    if (raw) {
      try {
        doc = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        throw new Error(`existing ${filePath} is not valid JSON — left untouched`);
      }
    }
  }
  const bucket =
    doc[topKey] && typeof doc[topKey] === "object"
      ? (doc[topKey] as Record<string, unknown>)
      : {};
  bucket[serverName] = entry;
  doc[topKey] = bucket;
  writeFileSync(filePath, `${JSON.stringify(doc, null, 2)}\n`);
}

function mergeCodexToml(
  filePath: string,
  serverName: string,
  launcher: Launcher,
  env: Record<string, string>,
): "written" | "skipped" {
  mkdirSync(dirname(filePath), { recursive: true });
  const existing = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
  const header = `[mcp_servers.${serverName}]`;
  // TOML is awkward to edit safely in place; if our block already exists, leave
  // the file alone rather than risk corrupting hand-edits.
  if (existing.includes(header)) return "skipped";

  const envInline = Object.entries(env)
    .map(([k, v]) => `${JSON.stringify(k)} = ${JSON.stringify(v)}`)
    .join(", ");
  const block =
    `\n${header}\n` +
    `command = ${JSON.stringify(launcher.command)}\n` +
    `args = [${launcher.args.map((a) => JSON.stringify(a)).join(", ")}]\n` +
    `env = { ${envInline} }\n`;
  writeFileSync(filePath, existing + block);
  return "written";
}
