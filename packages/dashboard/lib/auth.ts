import "server-only";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";

/* Stateless session: an encrypted (JWE) cookie. We encrypt rather than just sign
   because the payload carries the user's GitHub access token (used to list the
   repos they can reach — the tenancy model). httpOnly + encrypted keeps it
   confidential even if the cookie value is observed server-side. */

export const SESSION_COOKIE = "pheme_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface Session {
  login: string; // GitHub login
  email: string; // verified primary email — keys are scoped to this (AD-07 v2)
  name: string | null;
  avatarUrl: string | null;
  accessToken: string; // GitHub user-to-server token
}

function key(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not set");
  // Derive a stable 32-byte key for A256GCM from whatever secret is provided.
  return new Uint8Array(createHash("sha256").update(secret).digest());
}

export async function encodeSession(session: Session): Promise<string> {
  return new EncryptJWT({ ...session })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .encrypt(key());
}

export async function decodeSession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtDecrypt(token, key());
    if (!payload.login || !payload.email || !payload.accessToken) return null;
    return {
      login: String(payload.login),
      email: String(payload.email),
      name: payload.name ? String(payload.name) : null,
      avatarUrl: payload.avatarUrl ? String(payload.avatarUrl) : null,
      accessToken: String(payload.accessToken),
    };
  } catch {
    return null;
  }
}

/** Read the current session from the request cookies (server components/handlers). */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
