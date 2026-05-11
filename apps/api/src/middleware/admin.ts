import type { Context, Next } from "hono";

export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get("user") as { role?: string | null } | undefined;
  if (user?.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
}
