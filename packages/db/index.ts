import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL env var is required");
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });
export { schema };

export * from "./schema/recipes.js";
export * from "./schema/users.js";
export * from "./schema/auth.js";
