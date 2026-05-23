#!/usr/bin/env node
import { init } from "./commands/init.js";
import { status } from "./commands/status.js";
import { onboard } from "./commands/onboard.js";
import { keyCreate } from "./commands/key.js";

const USAGE = `memory — Project Memory CLI

Usage:
  memory init        Enroll the current repo (reads the git remote, registers it server-side)
  memory status      Show whether the current repo is enrolled
  memory onboard     Configure the phemesh-memory MCP server for every agent on this machine
  memory key:create  Mint a per-user API key (admin: uses the shared key)
  memory help        Show this help

Common options:
  --server <url>   memory-server base URL   (default: $MEMORY_SERVER_URL or http://localhost:4000)
  --key <key>      shared API key           (default: $MEMORY_API_KEY)

init / status options:
  --identifier <url>   use this remote URL instead of reading 'origin'
  --name <name>        display name for the project (init only)
  --enrolled-by <who>  who enrolled it (init only; default: $USER)

key:create options:
  --user <email>       the developer this key identifies (required)
  --label <name>       optional label for the key (e.g. 'laptop')

onboard options:
  --mcp-entry <path>   path to the built memory-mcp entry (default: monorepo dist)
  --all                write config even for agents not detected on this machine
`;

interface Parsed {
  _: string[];
  flags: Record<string, string | undefined>;
}

function parseArgs(argv: string[]): Parsed {
  const positional: string[] = [];
  const flags: Record<string, string | undefined> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === undefined) continue;
    if (token.startsWith("--")) {
      const body = token.slice(2);
      const eq = body.indexOf("=");
      if (eq >= 0) {
        flags[body.slice(0, eq)] = body.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("--")) {
          flags[body] = next;
          i += 1;
        } else {
          flags[body] = "true";
        }
      }
    } else {
      positional.push(token);
    }
  }
  return { _: positional, flags };
}

async function main(): Promise<void> {
  const { _, flags } = parseArgs(process.argv.slice(2));
  switch (_[0]) {
    case "init":
      await init(flags);
      break;
    case "status":
      await status(flags);
      break;
    case "onboard":
      await onboard(flags);
      break;
    case "key:create":
      await keyCreate(flags);
      break;
    case undefined:
    case "help":
      console.log(USAGE);
      break;
    default:
      console.error(`Unknown command: ${_[0]}\n`);
      console.log(USAGE);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
