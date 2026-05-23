import { execFileSync } from "node:child_process";

export function getRemoteUrl(): string {
  let raw: string;
  try {
    raw = execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    throw new Error(
      "Could not read the 'origin' git remote. Run this from a repo that has one, or pass --identifier <url>.",
    );
  }
  if (!raw) throw new Error("The 'origin' remote is empty.");
  return raw;
}

// Canonicalise so every developer on the same repo registers the *same* identifier
// regardless of how they cloned it (the property the opt-in registry relies on —
// SRS §4.1: "the remote URL is identical for all of them").
//   git@github.com:org/repo.git       -> github.com/org/repo
//   https://github.com/org/repo.git   -> github.com/org/repo
//   ssh://git@github.com/org/repo      -> github.com/org/repo
export function canonicalIdentifier(remoteUrl: string): string {
  let s = remoteUrl.trim();
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, ""); // strip scheme (https://, ssh://, ...)
  s = s.replace(/^[^@/]+@/, ""); // strip user@
  s = s.replace(":", "/"); // scp-style host:path -> host/path (first colon only)
  s = s.replace(/\.git$/i, ""); // strip trailing .git
  s = s.replace(/\/+$/, ""); // strip trailing slash
  return s.toLowerCase();
}
