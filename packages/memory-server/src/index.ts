import "./lib/load-env.js";
import express from "express";
import { apiKeyAuth } from "./middleware/auth.js";
import { logRouter } from "./routes/log.js";
import { contextRouter } from "./routes/context.js";
import { searchRouter } from "./routes/search.js";
import { supersedeRouter } from "./routes/supersede.js";
import { entriesRouter } from "./routes/entries.js";
import { projectsRouter } from "./routes/projects.js";
import { keysRouter } from "./routes/keys.js";

const PORT = Number.parseInt(process.env.PORT ?? "4000", 10);

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Authenticated routes.
app.use(apiKeyAuth);
app.use(logRouter);
app.use(contextRouter);
app.use(searchRouter);
app.use(supersedeRouter);
app.use(entriesRouter);
app.use(projectsRouter);
// Project-independent: enrollment and key minting carry no X-Project context.
app.use(keysRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[memory-server] error:", err);
  res.status(500).json({ error: "internal_error" });
});

app.listen(PORT, () => {
  console.log(`[memory-server] listening on http://localhost:${PORT}`);
});
