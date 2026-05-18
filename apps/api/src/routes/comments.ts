import { Hono } from "hono";
import { db, comments, recipes, user } from "@cooked/db";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { emailVerifiedMiddleware } from "../middleware/email-verified.js";
import { createCommentSchema, paginationSchema } from "../lib/validation.js";
import type { AppEnv } from "../lib/types.js";

const app = new Hono<AppEnv>();

app.get("/:slug/comments", async (c) => {
  const slug = c.req.param("slug")!;
  const { page, limit } = paginationSchema.parse({
    page: c.req.query("page"),
    limit: c.req.query("limit"),
  });
  const offset = (page - 1) * limit;

  const [recipe] = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(and(eq(recipes.slug, slug), eq(recipes.status, "published"), isNull(recipes.deletedAt)))
    .limit(1);

  if (!recipe) return c.json({ error: "Not found" }, 404);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        userName: user.name,
        userImage: user.image,
      })
      .from(comments)
      .innerJoin(user, eq(comments.userId, user.id))
      .where(and(eq(comments.recipeId, recipe.id), eq(comments.status, "approved")))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(comments)
      .where(and(eq(comments.recipeId, recipe.id), eq(comments.status, "approved"))),
  ]);

  return c.json({ comments: rows, page, limit, total });
});

app.post("/:slug/comments", authMiddleware, emailVerifiedMiddleware, async (c) => {
  const slug = c.req.param("slug")!;
  const u = c.get("user");
  const raw = await c.req.json();
  const result = createCommentSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ error: "Validation error", details: result.error.issues }, 400);
  }

  const [recipe] = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(and(eq(recipes.slug, slug), eq(recipes.status, "published"), isNull(recipes.deletedAt)))
    .limit(1);

  if (!recipe) return c.json({ error: "Not found" }, 404);

  const [comment] = await db
    .insert(comments)
    .values({
      userId: u.id,
      recipeId: recipe.id,
      content: result.data.content,
    })
    .returning();

  return c.json({ comment }, 201);
});

export default app;
