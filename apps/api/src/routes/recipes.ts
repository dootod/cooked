import { Hono } from "hono";
import { db, recipes, ingredients, steps, macros, medias } from "@cooked/db";
import { and, desc, eq, ilike } from "drizzle-orm";

const app = new Hono();

app.get("/", async (c) => {
  const page = Number(c.req.query("page") ?? 1);
  const limit = Number(c.req.query("limit") ?? 12);
  const offset = (page - 1) * limit;
  const search = c.req.query("search");

  const where = search
    ? and(eq(recipes.status, "published"), ilike(recipes.title, `%${search}%`))
    : eq(recipes.status, "published");

  const rows = await db
    .select()
    .from(recipes)
    .where(where)
    .orderBy(desc(recipes.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({ recipes: rows, page, limit });
});

app.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.slug, slug), eq(recipes.status, "published")))
    .limit(1);

  if (!recipe) return c.json({ error: "Not found" }, 404);

  const [recipeIngredients, recipeSteps, recipeMacro, recipeMedias] =
    await Promise.all([
      db
        .select()
        .from(ingredients)
        .where(eq(ingredients.recipeId, recipe.id))
        .orderBy(ingredients.order),
      db
        .select()
        .from(steps)
        .where(eq(steps.recipeId, recipe.id))
        .orderBy(steps.order),
      db.select().from(macros).where(eq(macros.recipeId, recipe.id)).limit(1),
      db.select().from(medias).where(eq(medias.recipeId, recipe.id)),
    ]);

  return c.json({
    recipe: {
      ...recipe,
      ingredients: recipeIngredients,
      steps: recipeSteps,
      macros: recipeMacro[0] ?? null,
      medias: recipeMedias,
    },
  });
});

export default app;
