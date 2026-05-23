import type { ServerConfig } from "./env.js";

export interface Project {
  id: string;
  identifier: string;
  name: string | null;
  enrolledBy: string | null;
  enrolledAt: string;
  active: boolean;
}

async function api<T>(cfg: ServerConfig, path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${cfg.serverUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new Error(`Could not reach memory-server at ${cfg.serverUrl}. Is it running?`);
  }
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized — check MEMORY_API_KEY.");
    throw new Error(`memory-server ${res.status} ${res.statusText}: ${text}`);
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export function registerProject(
  cfg: ServerConfig,
  identifier: string,
  name?: string,
  enrolledBy?: string,
): Promise<{ enrolled: boolean; created: boolean; project: Project }> {
  return api(cfg, "/projects", {
    method: "POST",
    body: JSON.stringify({ identifier, name, enrolledBy }),
  });
}

export function lookupProject(
  cfg: ServerConfig,
  identifier: string,
): Promise<{ enrolled: boolean; project: Project | null }> {
  return api(cfg, `/projects?identifier=${encodeURIComponent(identifier)}`);
}

export interface MintedKey {
  apiKey: string; // raw key, returned exactly once
  key: { id: string; userEmail: string; createdAt: string };
}

// Mint a per-user API key (AD-07 v2). Requires the shared admin key in cfg.
export function createKey(
  cfg: ServerConfig,
  userEmail: string,
  label?: string,
): Promise<MintedKey> {
  return api(cfg, "/keys", {
    method: "POST",
    body: JSON.stringify({ userEmail, label }),
  });
}
