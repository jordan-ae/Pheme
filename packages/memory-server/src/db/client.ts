import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// prepare:false is required for Supabase's transaction pooler (port 6543).
// Safe for direct connections too.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
export { schema };
