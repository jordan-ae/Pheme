import { NextRequest, NextResponse } from "next/server";
import { getInstallationAccount } from "@/lib/github";
import { saveInstallation } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GitHub App "Setup URL" target. After install/configure, GitHub redirects here with
// ?installation_id=&setup_action=. We persist the installation so the server can mint
// installation tokens, then bounce the user back to their projects.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  const url = new URL(req.url);
  const installationId = url.searchParams.get("installation_id");

  if (installationId) {
    try {
      const account = await getInstallationAccount(installationId);
      await saveInstallation({
        installation_id: installationId,
        account_login: account.login,
        account_type: account.type,
      });
    } catch (err) {
      console.error("[dashboard] install callback failed:", err);
      return NextResponse.redirect(new URL("/connect?error=install_failed", req.url));
    }
  }

  return NextResponse.redirect(new URL("/?installed=1", req.url));
}
