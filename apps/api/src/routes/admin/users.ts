import { Hono } from "hono";
import { db, user, session } from "@cooked/db";
import { eq, count, desc, isNull } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import {
  userPatchSchema,
  adminPaginationSchema,
} from "../../lib/validation.js";
import { logAudit } from "../../lib/audit.js";
import type { AppEnv } from "../../lib/types.js";

async function revokeUserSessions(userId: string) {
  await db.delete(session).where(eq(session.userId, userId));
}

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
  const query = adminPaginationSchema.parse(c.req.query());
  const offset = (query.page - 1) * query.limit;

  const [totalResult] = await db
    .select({ count: count() })
    .from(user)
    .where(isNull(user.deletedAt));
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
    .where(isNull(user.deletedAt))
    .orderBy(desc(user.createdAt))
    .limit(query.limit)
    .offset(offset);

  return c.json({
    users: rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: totalResult.count,
      totalPages: Math.ceil(totalResult.count / query.limit),
    },
  });
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");

  if (id === currentUser.id) {
    return c.json(
      { error: "Impossible de supprimer votre propre compte" },
      400,
    );
  }

  const [deleted] = await db
    .update(user)
    .set({
      deletedAt: new Date(),
      banned: true,
      banReason: "Compte supprime",
      updatedAt: new Date(),
    })
    .where(eq(user.id, id))
    .returning({ id: user.id });

  if (!deleted) return c.json({ error: "Not found" }, 404);

  await revokeUserSessions(id);

  await logAudit({
    userId: currentUser.id,
    action: "user.delete",
    targetId: id,
    targetType: "user",
  });

  return c.json({ ok: true });
});

app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");
  const raw = await c.req.json();
  const result = userPatchSchema.safeParse(raw);
  if (!result.success) {
    return c.json(
      { error: "Validation error", details: result.error.issues },
      400,
    );
  }
  const body = result.data;

  if (
    body.role !== undefined &&
    body.role !== "admin" &&
    id === currentUser.id
  ) {
    return c.json(
      { error: "Impossible de retirer votre propre role admin" },
      400,
    );
  }

  if (body.banned === true && id === currentUser.id) {
    return c.json({ error: "Impossible de vous bannir vous-meme" }, 400);
  }

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

  if (body.banned === true) {
    await revokeUserSessions(id);
    await logAudit({
      userId: currentUser.id,
      action: "user.ban",
      targetId: id,
      targetType: "user",
      metadata: { reason: body.banReason },
    });
  } else if (body.banned === false) {
    await logAudit({
      userId: currentUser.id,
      action: "user.unban",
      targetId: id,
      targetType: "user",
    });
  }

  if (body.role !== undefined) {
    await logAudit({
      userId: currentUser.id,
      action: "user.role_change",
      targetId: id,
      targetType: "user",
      metadata: { newRole: body.role },
    });
  }

  return c.json({ user: updated });
});

export default app;
