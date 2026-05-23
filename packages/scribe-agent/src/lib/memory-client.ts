// Thin HTTP client over the memory-server REST API.
// Used by the agent's tools at execution time.

const SERVER_URL = (process.env.MEMORY_SERVER_URL ?? "http://localhost:4000").replace(/\/$/, "");
const API_KEY = process.env.MEMORY_API_KEY;

if (!API_KEY) {
  throw new Error("MEMORY_API_KEY is not set. The scribe agent cannot talk to memory-server.");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SERVER_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`memory-server ${res.status} ${res.statusText}: ${text}`);
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export interface SearchHit {
  id: string;
  type: string;
  title: string;
  body: string;
  rationale: string | null;
  tags: string[];
  similarity: number;
}

export async function searchMemory(query: string, limit = 5, minSimilarity = 0.3) {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    minSimilarity: String(minSimilarity),
  });
  return request<{ query: string; results: SearchHit[] }>(`/search?${params.toString()}`);
}

export interface LogInput {
  type: "decision" | "tradeoff" | "question" | "constraint";
  title: string;
  body: string;
  rationale?: string;
  author?: string;
  branch?: string;
  scope?: "global" | "feature" | "spike" | "archived";
  tags?: string[];
  status?: "active" | "pending_review";
}

export async function postLog(entry: LogInput) {
  return request<{ id: string; entry: unknown } | { error: string; entryId?: string }>("/log", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export async function postSupersede(oldId: string, replacement: Omit<LogInput, "status">) {
  return request<{
    newEntry: { id: string; [k: string]: unknown };
    supersededEntry: { id: string; [k: string]: unknown };
  }>(`/entries/${encodeURIComponent(oldId)}/supersede`, {
    method: "POST",
    body: JSON.stringify(replacement),
  });
}
