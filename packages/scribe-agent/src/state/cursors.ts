import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

// Tracks how many lines of each (source, session) transcript we've already processed.
// Lets the agent be invoked on every Stop event without re-reading old content.
// File-backed for MVP; we'll move into the DB if multi-host deployment lands.

const STATE_DIR = process.env.SCRIBE_STATE_DIR ?? join(homedir(), ".phemesh-scribe");
const STATE_FILE = join(STATE_DIR, "cursors.json");

interface CursorState {
  cursors: Record<string, { processedLines: number; lastRunAt: string }>;
}

function readState(): CursorState {
  if (!existsSync(STATE_FILE)) return { cursors: {} };
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8")) as CursorState;
  } catch {
    return { cursors: {} };
  }
}

function writeState(state: CursorState) {
  if (!existsSync(dirname(STATE_FILE))) mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

const key = (sourceId: string, sessionId: string) => `${sourceId}:${sessionId}`;

export function getProcessedLines(sourceId: string, sessionId: string): number {
  return readState().cursors[key(sourceId, sessionId)]?.processedLines ?? 0;
}

export function setProcessedLines(sourceId: string, sessionId: string, lines: number) {
  const state = readState();
  state.cursors[key(sourceId, sessionId)] = {
    processedLines: lines,
    lastRunAt: new Date().toISOString(),
  };
  writeState(state);
}
