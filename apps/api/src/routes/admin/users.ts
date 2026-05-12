import { Hono } from "hono";
import { db } from "@cooked/db";
import { user, session } from "@cooked/db";
import { eq, count, desc } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";

const app = new Hono();

app.use("*", authMiddleware, adminMiddleware);

// GET /api/admin/users/stats
app.get("/stats", async (c) => {
  const [totalResult] = await db.select({ count: count() }).from(user);
  const [sessionsResult] = await db.select({ count: count() }).from(session);

  return c.json({
    totalUsers: totalResult.count,
    activeSessions: sessionsResult.count,
  });
});

// GET /api/admin/users
app.get("/", async (c) => {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));
  return c.json({ users: rows });
});

// PATCH /api/admin/users/:id — ban/unban, change role
app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const allowed: Record<string, unknown> = {};
  if ("role" in body) allowed.role = body.role;
  if ("banned" in body) {
    allowed.banned = body.banned;
    allowed.banReason = body.banReason ?? null;
  }

  const [updated] = await db
    .update(user)
    .set({ ...allowed, updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning();

  return c.json({ user: updated });
});

export default app;
