import type { Request, Response, NextFunction } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { projects } from "../db/schema.js";

// Resolves the caller's project from the `X-Project` header (the canonical git
// remote identifier, sent by the MCP wrapper) and pins it on res.locals so the
// data routes can hard-isolate reads/writes to that project (AD-13).
//
// Enrollment is opt-in (SRS §4): an unenrolled repo is rejected rather than
// auto-created, so memory only accrues for repos a human deliberately ran
// `memory init` on.
export async function resolveProject(req: Request, res: Response, next: NextFunction) {
  const identifier = req.header("X-Project")?.trim();
  if (!identifier) {
    res.status(400).json({
      error: "project_required",
      message:
        "No project context. The MCP wrapper sends X-Project from the repo's git remote; " +
        "run `memory init` to enroll this repo, or set MEMORY_PROJECT for a repo without a remote.",
    });
    return;
  }

  try {
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.identifier, identifier), eq(projects.active, true)),
    });
    if (!project) {
      res.status(403).json({
        error: "project_not_enrolled",
        identifier,
        hint: "Run `memory init` in this repo to enroll it before logging or reading memory.",
      });
      return;
    }

    res.locals.projectId = project.id;
    res.locals.projectIdentifier = project.identifier;
    next();
  } catch (err) {
    console.error("[memory-server] project resolution failed:", err);
    res.status(500).json({ error: "internal_error" });
  }
}
