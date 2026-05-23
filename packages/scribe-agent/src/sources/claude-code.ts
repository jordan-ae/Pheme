import { Router } from "express";
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { z } from "zod";
import { runScribeAgent } from "../agent.js";
import { getProcessedLines, setProcessedLines } from "../state/cursors.js";

// Claude Code Stop hook payload — published on stdin to the hook command.
// The Stop hook command curls that payload to this endpoint.
const StopPayloadSchema = z.object({
  session_id: z.string().min(1),
  transcript_path: z.string().min(1),
  cwd: z.string().optional(),
  hook_event_name: z.string().optional(),
});

const SOURCE_ID = "claude-code-stop";

export const claudeCodeRouter: Router = Router();

claudeCodeRouter.post("/events/claude-code-stop", async (req, res) => {
  const parsed = StopPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_payload", details: parsed.error.flatten() });
    return;
  }
  const { session_id: sessionId, transcript_path: transcriptPath, cwd } = parsed.data;

  if (!existsSync(transcriptPath)) {
    res.status(404).json({ error: "transcript_not_found", path: transcriptPath });
    return;
  }

  const allLines = readFileSync(transcriptPath, "utf8").split("\n").filter(Boolean);
  const alreadyProcessed = getProcessedLines(SOURCE_ID, sessionId);
  const newLines = allLines.slice(alreadyProcessed);

  if (newLines.length === 0) {
    res.json({ skipped: "no_new_content", processed: alreadyProcessed });
    return;
  }

  const text = newLines
    .map(formatTranscriptLine)
    .filter((s): s is string => s !== null)
    .join("\n\n");

  if (text.trim().length < 50) {
    // Only tool-call noise — advance the cursor and skip the agent call.
    setProcessedLines(SOURCE_ID, sessionId, allLines.length);
    res.json({ skipped: "only_noise", processed: allLines.length });
    return;
  }

  try {
    const result = await runScribeAgent({
      text,
      sourceId: SOURCE_ID,
      sessionId,
      branch: gitBranch(cwd) ?? "global",
    });
    setProcessedLines(SOURCE_ID, sessionId, allLines.length);
    res.json({ processed: allLines.length, agent: result });
  } catch (err) {
    // Don't advance the cursor on failure — we retry the same slice on the next Stop.
    console.error("[claude-code-stop] agent failed:", err);
    res.status(502).json({
      error: "agent_failed",
      message: err instanceof Error ? err.message : String(err),
      processed: alreadyProcessed,
    });
  }
});

function formatTranscriptLine(line: string): string | null {
  try {
    const ev = JSON.parse(line) as {
      type?: string;
      message?: { role?: string; content?: unknown };
    };
    if (ev.type !== "user" && ev.type !== "assistant") return null;
    const content = ev.message?.content;
    if (typeof content === "string") return `[${ev.type}] ${content}`;
    if (Array.isArray(content)) {
      const text = content
        .filter((b): b is { type: "text"; text: string } => b?.type === "text")
        .map((b) => b.text)
        .join("\n");
      return text ? `[${ev.type}] ${text}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function gitBranch(cwd?: string): string | null {
  if (!cwd) return null;
  try {
    const out = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
    });
    const branch = out.toString().trim();
    return branch && branch !== "HEAD" ? branch : null;
  } catch {
    return null;
  }
}
