import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

function makeClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL not set");
  }
  return postgres(url, {
    prepare: false,
    max: 4,
    idle_timeout: 30,
  });
}

export function sql() {
  if (!global.__pgClient) {
    global.__pgClient = makeClient();
  }
  return global.__pgClient;
}
