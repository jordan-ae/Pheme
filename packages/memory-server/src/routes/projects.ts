import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { projects } from "../db/schema.js";

const RegisterSchema = z.object({
  identifier: z.string().min(1).max(500), // canonical git remote URL
  name: z.string().max(200).optional(),
  enrolledBy: z.string().max(200).optional(),
  // Optional GitHub linkage when enrolled through the dashboard's GitHub App.
  githubRepoId: z.string().max(64).optional(),
  githubInstallationId: z.string().max(64).optional(),
});

const ParamsSchema = z.object({ id: z.string().uuid() });

export const projectsRouter: Router = Router();

// Enroll (opt-in) a repo by its canonical git remote URL. Idempotent: re-running
// on an already-registered repo re-activates it and returns the existing record,
// which is what makes every developer on the same remote auto-enrolled (SRS §4.1).
projectsRouter.post("/projects", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
    return;
  }
  const { identifier, name, enrolledBy, githubRepoId, githubInstallationId } = parsed.data;

  const existing = await db.query.projects.findFirst({
    where: eq(projects.identifier, identifier),
  });
  if (existing) {
    const [updated] = await db
      .update(projects)
      .set({
        active: true,
        name: name ?? existing.name,
        enrolledBy: enrolledBy ?? existing.enrolledBy,
        githubRepoId: githubRepoId ?? existing.githubRepoId,
        githubInstallationId: githubInstallationId ?? existing.githubInstallationId,
      })
      .where(eq(projects.id, existing.id))
      .returning();
    res.status(200).json({ enrolled: true, created: false, project: updated });
    return;
  }

  const [created] = await db
    .insert(projects)
    .values({ identifier, name, enrolledBy, githubRepoId, githubInstallationId })
    .returning();
  res.status(201).json({ enrolled: true, created: true, project: created });
});

// Off-board a project (SRS project off-boarding; full deactivate, tech-lead choice
// 2026-05-23). Sets active=false: the project middleware then rejects all reads and
// writes for it (403), so memory collection stops and existing memory is frozen out
// of agent context. Nothing is hard-deleted (AD-10) — re-enrolling via POST /projects
// reactivates it. Admin-gated; the dashboard verifies the caller's GitHub access to
// the repo before invoking this.
projectsRouter.post("/projects/:id/deactivate", async (req, res) => {
  if (res.locals.authKind !== "shared") {
    res.status(403).json({
      error: "admin_required",
      message: "Off-boarding a project requires the shared MEMORY_API_KEY (admin).",
    });
    return;
  }
  const params = ParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const [updated] = await db
    .update(projects)
    .set({ active: false })
    .where(eq(projects.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "not_found", id: params.data.id });
    return;
  }
  res.json({ offboarded: true, project: updated });
});

// Lookup one repo's enrollment (?identifier=<url>), or list all enrolled repos.
projectsRouter.get("/projects", async (req, res) => {
  const identifier = typeof req.query.identifier === "string" ? req.query.identifier : undefined;
  if (identifier) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.identifier, identifier),
    });
    res.json({ enrolled: Boolean(project?.active), project: project ?? null });
    return;
  }
  // includeInactive surfaces off-boarded projects too, so the dashboard can show
  // and re-enroll them. Admin-gated, since off-boarded projects are otherwise
  // invisible to ordinary callers.
  const includeInactive = req.query.includeInactive === "true";
  if (includeInactive) {
    if (res.locals.authKind !== "shared") {
      res.status(403).json({
        error: "admin_required",
        message: "Listing inactive projects requires the shared MEMORY_API_KEY (admin).",
      });
      return;
    }
    const all = await db.select().from(projects);
    res.json({ projects: all });
    return;
  }

  const all = await db.select().from(projects).where(eq(projects.active, true));
  res.json({ projects: all });
});
