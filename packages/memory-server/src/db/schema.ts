import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  vector,
  index,
  boolean,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const entryTypeEnum = pgEnum("entry_type", [
  "decision",
  "tradeoff",
  "question",
  "constraint",
]);

export const entryScopeEnum = pgEnum("entry_scope", [
  "global",
  "feature",
  "spike",
  "archived",
]);

export const entryStatusEnum = pgEnum("entry_status", [
  "active",
  "superseded",
  "archived",
  "discarded",
  "pending_review",
]);

export const memoryEntries = pgTable(
  "memory_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: entryTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    rationale: text("rationale"),
    author: text("author"),
    // Project owner (AD-13). Every entry belongs to exactly one enrolled repo;
    // reads are hard-isolated to the caller's project so no cross-repo memory leaks.
    projectId: uuid("project_id")
      .notNull()
      .references((): AnyPgColumn => projects.id),
    branch: text("branch").notNull().default("global"),
    scope: entryScopeEnum("scope").notNull().default("global"),
    tags: text("tags").array().notNull().default([]),
    status: entryStatusEnum("status").notNull().default("active"),
    embedding: vector("embedding", { dimensions: 1536 }),
    contentHash: text("content_hash").notNull().unique(),
    supersedesId: uuid("supersedes_id").references((): AnyPgColumn => memoryEntries.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("memory_entries_branch_idx").on(t.branch),
    index("memory_entries_type_idx").on(t.type),
    index("memory_entries_status_idx").on(t.status),
    index("memory_entries_supersedes_idx").on(t.supersedesId),
    index("memory_entries_project_idx").on(t.projectId),
  ],
);

export type MemoryEntry = typeof memoryEntries.$inferSelect;
export type NewMemoryEntry = typeof memoryEntries.$inferInsert;

// Opt-in project registry (SRS §4, §10). A repo is enrolled by registering its
// canonical git remote URL via `memory init`. Enrollment is server-side only —
// nothing is committed to the repo.
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull().unique(), // canonical git remote URL
    name: text("name"),
    enrolledBy: text("enrolled_by"),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
    active: boolean("active").notNull().default(true),
    // Optional GitHub linkage (set when enrolled through the dashboard's GitHub App).
    // A repo can still be enrolled by raw identifier via `memory init` with these null.
    githubRepoId: text("github_repo_id"),
    githubInstallationId: text("github_installation_id"),
  },
  (t) => [index("projects_active_idx").on(t.active)],
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// GitHub App installations (dashboard). Persisted so the server can mint
// installation tokens for repo-content access. Sessions are stateless JWT
// cookies, so no session table is needed.
export const githubInstallations = pgTable(
  "github_installations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    installationId: text("installation_id").notNull().unique(),
    accountLogin: text("account_login").notNull(),
    accountType: text("account_type"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("github_installations_account_idx").on(t.accountLogin)],
);

export type GithubInstallation = typeof githubInstallations.$inferSelect;
export type NewGithubInstallation = typeof githubInstallations.$inferInsert;

// Per-user API keys (AD-07 v2, greenlit by tech-lead sign-off 2026-05-23).
// We store only the SHA-256 hash of each key, never the raw value. The server
// derives the authenticated author from the presented key, so authorship is
// verified rather than self-reported. The shared MEMORY_API_KEY remains a
// transitional fallback (entries written under it are attributed "anonymous").
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    keyHash: text("key_hash").notNull().unique(), // sha256(rawKey)
    userEmail: text("user_email").notNull(),
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [index("api_keys_user_idx").on(t.userEmail)],
);

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
