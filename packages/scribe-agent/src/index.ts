import "./lib/load-env.js";
import express from "express";
import { claudeCodeRouter } from "./sources/claude-code.js";
import { SCRIBE_MODEL_DESCRIPTION } from "./lib/model.js";

const PORT = Number.parseInt(process.env.SCRIBE_AGENT_PORT ?? "5000", 10);
const EXPECTED_KEY = process.env.MEMORY_API_KEY;

if (!EXPECTED_KEY) {
  throw new Error("MEMORY_API_KEY is not set");
}

const app = express();
app.use(express.json({ limit: "8mb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "scribe-agent",
    model: SCRIBE_MODEL_DESCRIPTION,
    time: new Date().toISOString(),
  });
});

// All event endpoints require the same bearer key as memory-server.
app.use((req, res, next) => {
  const header = req.header("Authorization");
  if (header !== `Bearer ${EXPECTED_KEY}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
});

app.use(claudeCodeRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[scribe-agent] error:", err);
  res.status(500).json({ error: "internal_error" });
});

app.listen(PORT, () => {
  console.log(`[scribe-agent] listening on http://localhost:${PORT} (model=${SCRIBE_MODEL_DESCRIPTION})`);
});
