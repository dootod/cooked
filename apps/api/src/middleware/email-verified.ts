import type { Context, Next } from "hono";
import type { AppEnv } from "../lib/types.js";

export async function emailVerifiedMiddleware(c: Context<AppEnv>, next: Next) {
  const user = c.get("user");
  if (!user.emailVerified) {
    return c.json({ error: "Email non verifie. Verifiez votre email avant de continuer." }, 403);
  }
  await next();
}
