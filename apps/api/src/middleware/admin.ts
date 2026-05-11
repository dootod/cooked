import type { Context, Next } from "hono";

export async function adminMiddleware(c: Context, next: Next) {
  // TODO: check user role === "admin" from context set by authMiddleware
  const user = c.get("user" as never);
  if (!user || (user as { role: string }).role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
}
