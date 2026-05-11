/**
 * Creates the first admin user.
 * Run from apps/api/ with: tsx --env-file=.env src/scripts/seed-admin.ts
 */
import { auth } from "../lib/auth.js";
import { db, user as userTable } from "@cooked/db";
import { eq } from "drizzle-orm";

const EMAIL = process.env.ADMIN_EMAIL ?? "admin@cooked.fr";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123456";
const NAME = process.env.ADMIN_NAME ?? "Admin";

console.log(`Creating admin: ${EMAIL}`);

try {
  await auth.api.signUpEmail({
    body: { email: EMAIL, password: PASSWORD, name: NAME },
  });
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  if (!message.includes("already exists") && !message.includes("UNIQUE")) {
    console.error("Sign-up error:", message);
    process.exit(1);
  }
  console.log("User already exists, updating role...");
}

await db.update(userTable).set({ role: "admin" }).where(eq(userTable.email, EMAIL));
console.log("Done. Admin created:", EMAIL, "/ password:", PASSWORD);
process.exit(0);
