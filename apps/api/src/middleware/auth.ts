import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, "auth-token");
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  // TODO: verify JWT and attach user to context
  await next();
}
