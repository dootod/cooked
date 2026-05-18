import { Hono } from "hono";
import { db, comments, user, recipes } from "@cooked/db";
import { count, desc, eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import { commentStatusSchema, adminPaginationSchema } from "../../lib/validation.js";
import { logAudit } from "../../lib/audit.js";
import type { AppEnv } from "../../lib/types.js";

const app = new Hono<AppEnv>();

app.use("*", authMiddleware, adminMiddleware);

app.get("/", async (c) => {
  const query = adminPaginationSchema.parse(c.req.query());
  const offset = (query.page - 1) * query.limit;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: comments.id,
        content: comments.content,
        status: comments.status,
        createdAt: comments.createdAt,
        userName: user.name,
        userEmail: user.email,
        recipeTitle: recipes.title,
        recipeSlug: recipes.slug,
      })
      .from(comments)
      .innerJoin(user, eq(comments.userId, user.id))
      .innerJoin(recipes, eq(comments.recipeId, recipes.id))
      .where(eq(comments.status, "pending"))
      .orderBy(desc(comments.createdAt))
      .limit(query.limit)
      .offset(offset),
    db.select({ total: count() }).from(comments).where(eq(comments.status, "pending")),
  ]);

  return c.json({
    comments: rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  });
});

app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");
  const raw = await c.req.json();
  const result = commentStatusSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ error: "Status doit etre 'approved' ou 'rejected'" }, 400);
  }

  const [comment] = await db
    .update(comments)
    .set({ status: result.data.status })
    .where(eq(comments.id, id))
    .returning();

  if (!comment) return c.json({ error: "Not found" }, 404);

  await logAudit({
    userId: currentUser.id,
    action: result.data.status === "approved" ? "comment.approve" : "comment.reject",
    targetId: id,
    targetType: "comment",
  });

  return c.json({ comment });
});

export default app;
