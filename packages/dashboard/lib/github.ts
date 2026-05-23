import "server-only";
import { SignJWT, importPKCS8 } from "jose";

/* GitHub App client. One App does double duty:
   • user-to-server OAuth  → identity (login + verified email) and the token used
     to list the repos a signed-in user can reach (tenancy).
   • App installation      → installation tokens for repo CONTENT access. The token
     helper exists for future scribe-on-PR work; the PR-review surface itself is an
     unresolved open question and is intentionally NOT built here.
   No octokit dependency — plain fetch against api.github.com. */

const GH_API = "https://api.github.com";
const GH_WEB = "https://github.com";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
}

function baseUrl(): string {
  return process.env.DASHBOARD_URL ?? "http://localhost:3002";
}

export interface Viewer {
  login: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface GitHubRepo {
  id: number;
  fullName: string; // owner/repo
  identifier: string; // github.com/owner/repo (the project identifier)
  ownerLogin: string;
  private: boolean;
  description: string | null;
  installationId: string; // the App installation this repo is reachable through
}

// ---- user-to-server OAuth (identity) ----

export function authorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env("GITHUB_APP_CLIENT_ID"),
    redirect_uri: `${baseUrl()}/api/auth/github/callback`,
    state,
  });
  return `${GH_WEB}/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch(`${GH_WEB}/login/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: env("GITHUB_APP_CLIENT_ID"),
      client_secret: env("GITHUB_APP_CLIENT_SECRET"),
      code,
      redirect_uri: `${baseUrl()}/api/auth/github/callback`,
    }),
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(`github token exchange failed: ${data.error ?? res.status}`);
  }
  return data.access_token;
}

async function gh<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${GH_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`github ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getViewer(token: string): Promise<Viewer> {
  const user = await gh<{ login: string; name: string | null; avatar_url: string; email: string | null }>(
    "/user",
    token,
  );
  let email = user.email ?? "";
  if (!email) {
    // The /user email is null when the user hides it; pull the verified primary.
    const emails = await gh<{ email: string; primary: boolean; verified: boolean }[]>(
      "/user/emails",
      token,
    );
    email = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? "";
  }
  return { login: user.login, email, name: user.name, avatarUrl: user.avatar_url };
}

// ---- repos the signed-in user can reach (tenancy) ----

type RawRepo = {
  id: number;
  full_name: string;
  owner: { login: string };
  private: boolean;
  description: string | null;
};

function toRepo(r: RawRepo, installationId: string): GitHubRepo {
  return {
    id: r.id,
    fullName: r.full_name,
    identifier: `github.com/${r.full_name}`,
    ownerLogin: r.owner.login,
    private: r.private,
    description: r.description,
    installationId,
  };
}

/** Repos the user can access through the App's installations (one or two pages). */
export async function listAccessibleRepos(token: string): Promise<GitHubRepo[]> {
  const { installations } = await gh<{ installations: { id: number }[] }>(
    "/user/installations?per_page=100",
    token,
  );
  const all: GitHubRepo[] = [];
  for (const inst of installations) {
    const data = await gh<{ repositories: RawRepo[] }>(
      `/user/installations/${inst.id}/repositories?per_page=100`,
      token,
    );
    for (const r of data.repositories) all.push(toRepo(r, String(inst.id)));
  }
  return all;
}

// ---- App installation ----

export function installUrl(): string {
  return `${GH_WEB}/apps/${env("GITHUB_APP_SLUG")}/installations/new`;
}

export async function getInstallationAccount(
  installationId: string,
): Promise<{ login: string; type: string }> {
  const token = await appJwt();
  const data = await gh<{ account: { login: string; type: string } }>(
    `/app/installations/${installationId}`,
    token,
  );
  return { login: data.account.login, type: data.account.type };
}

/** Short-lived App JWT (RS256), the credential for App-level endpoints. */
async function appJwt(): Promise<string> {
  const pkcs8 = env("GITHUB_APP_PRIVATE_KEY").replace(/\\n/g, "\n");
  const pk = await importPKCS8(pkcs8, "RS256");
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now - 30)
    .setExpirationTime(now + 9 * 60)
    .setIssuer(env("GITHUB_APP_ID"))
    .sign(pk);
}

/** Installation token for repo CONTENT access. Reserved for future scribe-on-PR
    work — not consumed by any current dashboard feature (open question). */
export async function getInstallationToken(installationId: string): Promise<string> {
  const jwt = await appJwt();
  const res = await fetch(`${GH_API}/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`installation token -> ${res.status}`);
  const data = (await res.json()) as { token: string };
  return data.token;
}
