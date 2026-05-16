import type { Context, Next } from "hono";
import { auth } from "../lib/auth.js";
import type { AppEnv } from "../lib/types.js";

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const user = session.user as AppEnv["Variables"]["user"];
  if (user.banned) {
    return c.json({ error: "Compte suspendu" }, 403);
  }
  c.set("user", user);
  c.set("session", session.session as AppEnv["Variables"]["session"]);
  await next();
}
