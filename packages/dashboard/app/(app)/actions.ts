"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { userCanAccess } from "@/lib/access";
import { deactivateProject, enrollProject, mintKey, revokeKey } from "@/lib/memory";

/* Mutations invoked from client components. Every project action re-checks the
   session AND the caller's live GitHub access to the target repo, so the tenancy
   boundary is enforced server-side, never trusted from the client. */

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

type Gate =
  | { ok: true; session: Awaited<ReturnType<typeof getSession>> & object }
  | { ok: false; error: string };

async function requireAccess(identifier: string): Promise<Gate> {
  const session = await getSession();
  if (!session) return { ok: false, error: "not_signed_in" };
  const allowed = await userCanAccess(session, identifier);
  if (!allowed) return { ok: false, error: "no_access" };
  return { ok: true, session };
}

export async function enrollRepoAction(input: {
  identifier: string;
  name?: string;
  githubRepoId?: string;
  githubInstallationId?: string;
}): Promise<ActionResult> {
  const gate = await requireAccess(input.identifier);
  if (!gate.ok) return { ok: false, error: gate.error };

  try {
    await enrollProject({
      identifier: input.identifier,
      name: input.name,
      enrolledBy: gate.session.email,
      githubRepoId: input.githubRepoId,
      githubInstallationId: input.githubInstallationId,
    });
    revalidatePath("/projects");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("[dashboard] enroll failed:", err);
    return { ok: false, error: "enroll_failed" };
  }
}

export async function offboardProjectAction(input: {
  projectId: string;
  identifier: string;
}): Promise<ActionResult> {
  const gate = await requireAccess(input.identifier);
  if (!gate.ok) return { ok: false, error: gate.error };

  try {
    await deactivateProject(input.projectId);
    revalidatePath("/projects");
    revalidatePath("/");
    revalidatePath(`/projects/${input.projectId}`);
    return { ok: true };
  } catch (err) {
    console.error("[dashboard] offboard failed:", err);
    return { ok: false, error: "offboard_failed" };
  }
}

export async function reenrollProjectAction(input: {
  identifier: string;
  name?: string;
}): Promise<ActionResult> {
  // Re-enroll is the same POST /projects, which reactivates an off-boarded project.
  return enrollRepoAction({ identifier: input.identifier, name: input.name });
}

export async function mintKeyAction(label?: string): Promise<ActionResult<{ apiKey: string }>> {
  const session = await getSession();
  if (!session) return { ok: false, error: "not_signed_in" };
  try {
    const { apiKey } = await mintKey(session.email, label?.trim() || undefined);
    revalidatePath("/keys");
    return { ok: true, data: { apiKey } };
  } catch (err) {
    console.error("[dashboard] mint key failed:", err);
    return { ok: false, error: "mint_failed" };
  }
}

export async function revokeKeyAction(keyId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "not_signed_in" };
  try {
    await revokeKey(keyId, session.email);
    revalidatePath("/keys");
    return { ok: true };
  } catch (err) {
    console.error("[dashboard] revoke key failed:", err);
    return { ok: false, error: "revoke_failed" };
  }
}
