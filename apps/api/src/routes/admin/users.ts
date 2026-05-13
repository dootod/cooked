import { Hono } from "hono";
import { db, user, session } from "@cooked/db";
import { eq, count, desc } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import { userPatchSchema } from "../../lib/validation.js";
import type { AppEnv } from "../../lib/types.js";

const app = new Hono<AppEnv>();

app.use("*", authMiddleware, adminMiddleware);

app.get("/stats", async (c) => {
  const [totalResult] = await db.select({ count: count() }).from(user);
  const [sessionsResult] = await db.select({ count: count() }).from(session);

  return c.json({
    totalUsers: totalResult.count,
    activeSessions: sessionsResult.count,
  });
});

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
    .orderBy(desc(user.createdAt))
    .limit(200);
  return c.json({ users: rows });
});

app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const raw = await c.req.json();
  const result = userPatchSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ error: "Validation error", details: result.error.issues }, 400);
  }
  const body = result.data;

  const allowed: Record<string, unknown> = {};
  if (body.role !== undefined) allowed.role = body.role;
  if (body.banned !== undefined) {
    allowed.banned = body.banned;
    allowed.banReason = body.banReason ?? null;
  }

  if (Object.keys(allowed).length === 0) {
    return c.json({ error: "Aucun champ a modifier" }, 400);
  }

  const [updated] = await db
    .update(user)
    .set({ ...allowed, updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning();

  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json({ user: updated });
});

export default app;
