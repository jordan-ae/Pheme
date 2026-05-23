import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getViewer } from "@/lib/github";
import { encodeSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";

const STATE_COOKIE = "pheme_oauth_state";

// OAuth callback: verify state, exchange the code for a user token, resolve the
// viewer's identity, and mint the session cookie.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = req.cookies.get(STATE_COOKIE)?.value;

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, req.url));

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail("state_mismatch");
  }

  try {
    const token = await exchangeCodeForToken(code);
    const viewer = await getViewer(token);
    if (!viewer.email) return fail("no_verified_email");

    const cookie = await encodeSession({
      login: viewer.login,
      email: viewer.email,
      name: viewer.name,
      avatarUrl: viewer.avatarUrl,
      accessToken: token,
    });

    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set(SESSION_COOKIE, cookie, SESSION_COOKIE_OPTIONS);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (err) {
    console.error("[dashboard] github callback failed:", err);
    return fail("oauth_failed");
  }
}
