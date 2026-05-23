// Thin HTTP client over the memory-server REST API.
// Reads MEMORY_SERVER_URL and MEMORY_API_KEY from the env the MCP host
// (Claude Code / Cursor / etc.) injects into the spawned process.

import { PROJECT_IDENTIFIER } from "./project.js";

const SERVER_URL = (process.env.MEMORY_SERVER_URL ?? "http://localhost:4000").replace(/\/$/, "");
const API_KEY = process.env.MEMORY_API_KEY;

if (!API_KEY) {
  throw new Error(
    "MEMORY_API_KEY is not set. Add it to the mcpServers env block in your agent config.",
  );
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${SERVER_URL}${path}`;
  // Tell the server which repo this is so it isolates memory per project (AD-13).
  // Omitted only when no project could be resolved; the server then returns a
  // 400 with guidance to run `memory init` or set MEMORY_PROJECT.
  const projectHeader: Record<string, string> = PROJECT_IDENTIFIER
    ? { "X-Project": PROJECT_IDENTIFIER }
    : {};
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...projectHeader,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`memory-server ${res.status} ${res.statusText}: ${text}`);
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export interface ContextQuery {
  branch?: string;
  files?: string[];
  types?: Array<"decision" | "tradeoff" | "question" | "constraint">;
  maxTokens?: number;
}

export interface ContextResponse {
  branch: string;
  cap: number;
  constraints: unknown[];
  entries: unknown[];
  truncated: boolean;
  omittedCount: number;
  tokensUsed: number;
}

export async function getContext(query: ContextQuery): Promise<ContextResponse> {
  const params = new URLSearchParams();
  if (query.branch) params.set("branch", query.branch);
  if (query.files?.length) params.set("files", query.files.join(","));
  if (query.types?.length) params.set("types", query.types.join(","));
  if (query.maxTokens) params.set("maxTokens", String(query.maxTokens));
  const qs = params.toString();
  return request<ContextResponse>(`/context${qs ? `?${qs}` : ""}`);
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  body: string;
  rationale: string | null;
  tags: string[];
  similarity: number;
}

export async function searchMemory(
  q: string,
  limit = 5,
  minSimilarity = 0.2,
): Promise<{ query: string; results: SearchResult[] }> {
  const params = new URLSearchParams({
    q,
    limit: String(limit),
    minSimilarity: String(minSimilarity),
  });
  return request(`/search?${params.toString()}`);
}

export interface LogEntryInput {
  type: "decision" | "tradeoff" | "question" | "constraint";
  title: string;
  body: string;
  rationale?: string;
  author?: string;
  branch?: string;
  scope?: "global" | "feature" | "spike" | "archived";
  tags?: string[];
}

export async function logEntry(entry: LogEntryInput): Promise<{ id: string; entry: unknown }> {
  return request("/log", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}
