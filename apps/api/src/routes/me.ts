import { Hono } from "hono";
import { db, favorites, recipes, user } from "@cooked/db";
import { and, eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import type { AppEnv } from "../lib/types.js";

const app = new Hono<AppEnv>();

app.use("*", authMiddleware);

app.get("/", async (c) => {
  const u = c.get("user");
  return c.json({
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      image: u.image,
    },
  });
});

app.patch("/", async (c) => {
  const u = c.get("user");
  const body = await c.req.json();
  const name = body.name?.trim();
  if (!name || name.length > 100) {
    return c.json({ error: "Nom invalide" }, 400);
  }
  await db.update(user).set({ name }).where(eq(user.id, u.id));
  return c.json({ ok: true });
});

app.get("/favorites", async (c) => {
  const u = c.get("user");

  const rows = await db
    .select({
      recipeId: favorites.recipeId,
      createdAt: favorites.createdAt,
      title: recipes.title,
      slug: recipes.slug,
      description: recipes.description,
      prepTime: recipes.prepTime,
      cookTime: recipes.cookTime,
      difficulty: recipes.difficulty,
      servings: recipes.servings,
    })
    .from(favorites)
    .innerJoin(recipes, eq(favorites.recipeId, recipes.id))
    .where(eq(favorites.userId, u.id));

  return c.json({ favorites: rows });
});

app.post("/favorites/:id", async (c) => {
  const recipeId = c.req.param("id");
  const u = c.get("user");

  const [recipe] = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);
  if (!recipe) return c.json({ error: "Recette introuvable" }, 404);

  const [existing] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, u.id), eq(favorites.recipeId, recipeId)))
    .limit(1);

  if (existing) return c.json({ ok: true });

  await db.insert(favorites).values({
    userId: u.id,
    recipeId,
  });

  return c.json({ ok: true }, 201);
});

app.delete("/favorites/:id", async (c) => {
  const recipeId = c.req.param("id");
  const u = c.get("user");

  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, u.id), eq(favorites.recipeId, recipeId)));

  return c.json({ ok: true });
});

export default app;
