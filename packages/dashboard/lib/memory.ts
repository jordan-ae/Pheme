/* Server-side client for the memory-server REST API. The dashboard holds the
   shared MEMORY_API_KEY (admin) and acts on behalf of the signed-in user — minting/
   listing/revoking keys scoped to their email, and reading project memory with the
   X-Project header (the canonical git identifier). Never import this from a client
   component: it carries the admin key. */

import "server-only";

const BASE = process.env.MEMORY_SERVER_URL ?? "http://localhost:4000";
const ADMIN_KEY = process.env.MEMORY_API_KEY;

export type EntryType = "decision" | "tradeoff" | "question" | "constraint";
export type EntryStatus =
  | "active"
  | "superseded"
  | "archived"
  | "discarded"
  | "pending_review";

export interface MemoryEntry {
  id: string;
  type: EntryType;
  title: string;
  body: string;
  rationale: string | null;
  author: string | null;
  branch: string;
  scope: string;
  tags: string[];
  status: EntryStatus;
  supersedesId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  identifier: string;
  name: string | null;
  enrolledBy: string | null;
  enrolledAt: string;
  active: boolean;
  githubRepoId: string | null;
  githubInstallationId: string | null;
}

export interface ApiKeyMeta {
  id: string;
  userEmail: string;
  label: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

class MemoryApiError extends Error {
  constructor(
    public status: number,
    public payload: unknown,
  ) {
    super(`memory-server ${status}`);
  }
}

async function call<T>(
  path: string,
  opts: { method?: string; project?: string; body?: unknown } = {},
): Promise<T> {
  if (!ADMIN_KEY) throw new Error("MEMORY_API_KEY not set");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${ADMIN_KEY}`,
  };
  if (opts.project) headers["X-Project"] = opts.project;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  const payload = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new MemoryApiError(res.status, payload);
  return payload as T;
}

// ---- Projects ----

export async function listActiveProjects(): Promise<Project[]> {
  const { projects } = await call<{ projects: Project[] }>("/projects");
  return projects;
}

export async function listAllProjects(): Promise<Project[]> {
  const { projects } = await call<{ projects: Project[] }>(
    "/projects?includeInactive=true",
  );
  return projects;
}

export async function enrollProject(input: {
  identifier: string;
  name?: string;
  enrolledBy?: string;
  githubRepoId?: string;
  githubInstallationId?: string;
}): Promise<Project> {
  const { project } = await call<{ project: Project }>("/projects", {
    method: "POST",
    body: input,
  });
  return project;
}

export async function deactivateProject(id: string): Promise<Project> {
  const { project } = await call<{ project: Project }>(`/projects/${id}/deactivate`, {
    method: "POST",
  });
  return project;
}

// ---- Entries (browse + search), scoped to a project identifier ----

export async function listEntries(
  identifier: string,
  opts: { type?: EntryType[]; status?: EntryStatus[]; branch?: string; limit?: number; offset?: number } = {},
): Promise<{ entries: MemoryEntry[]; total: number }> {
  const qs = new URLSearchParams();
  if (opts.type?.length) qs.set("type", opts.type.join(","));
  if (opts.status?.length) qs.set("status", opts.status.join(","));
  if (opts.branch) qs.set("branch", opts.branch);
  if (opts.limit) qs.set("limit", String(opts.limit));
  if (opts.offset) qs.set("offset", String(opts.offset));
  const q = qs.toString();
  return call(`/entries${q ? `?${q}` : ""}`, { project: identifier });
}

export async function searchEntries(
  identifier: string,
  query: string,
  limit = 10,
): Promise<{ results: (MemoryEntry & { similarity: number })[] }> {
  const qs = new URLSearchParams({ q: query, limit: String(limit) });
  return call(`/search?${qs.toString()}`, { project: identifier });
}

// ---- API keys (admin-gated, scoped to a user email) ----

export async function listKeys(userEmail: string): Promise<ApiKeyMeta[]> {
  const qs = new URLSearchParams({ userEmail });
  const { keys } = await call<{ keys: ApiKeyMeta[] }>(`/keys?${qs.toString()}`);
  return keys;
}

export async function mintKey(
  userEmail: string,
  label?: string,
): Promise<{ apiKey: string; key: ApiKeyMeta }> {
  return call("/keys", { method: "POST", body: { userEmail, label } });
}

export async function revokeKey(id: string, userEmail: string): Promise<ApiKeyMeta> {
  const qs = new URLSearchParams({ userEmail });
  const { revoked } = await call<{ revoked: ApiKeyMeta }>(`/keys/${id}?${qs.toString()}`, {
    method: "DELETE",
  });
  return revoked;
}

export { MemoryApiError };
