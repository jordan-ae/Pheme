import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { projects } from "../db/schema.js";

const RegisterSchema = z.object({
  identifier: z.string().min(1).max(500), // canonical git remote URL
  name: z.string().max(200).optional(),
  enrolledBy: z.string().max(200).optional(),
});

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
  const { identifier, name, enrolledBy } = parsed.data;

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
      })
      .where(eq(projects.id, existing.id))
      .returning();
    res.status(200).json({ enrolled: true, created: false, project: updated });
    return;
  }

  const [created] = await db.insert(projects).values({ identifier, name, enrolledBy }).returning();
  res.status(201).json({ enrolled: true, created: true, project: created });
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
  const all = await db.select().from(projects).where(eq(projects.active, true));
  res.json({ projects: all });
});
