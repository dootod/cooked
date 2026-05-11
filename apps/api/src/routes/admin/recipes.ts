import { Hono } from "hono";
import { db, recipes, ingredients, steps, macros, medias } from "@cooked/db";
import { desc, eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import { generateSlug } from "../../lib/utils.js";

const app = new Hono();
app.use("*", authMiddleware, adminMiddleware);

app.get("/", async (c) => {
  const rows = await db
    .select()
    .from(recipes)
    .orderBy(desc(recipes.createdAt));
  return c.json({ recipes: rows });
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, id))
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

app.post("/", async (c) => {
  const body = await c.req.json<{
    title: string;
    slug?: string;
    description?: string;
    prepTime: number;
    cookTime: number;
    difficulty: "easy" | "intermediate" | "hard";
    servings: number;
    status?: "draft" | "published";
    videoUrl?: string;
    macros?: { kcal: number; protein: number; carbs: number; fat: number };
    ingredients?: Array<{ name: string; quantity?: number; unit?: string; note?: string }>;
    steps?: Array<{ content: string }>;
  }>();

  if (!body.title) return c.json({ error: "Titre requis" }, 400);

  const [recipe] = await db
    .insert(recipes)
    .values({
      title: body.title,
      slug: body.slug || generateSlug(body.title),
      description: body.description ?? null,
      prepTime: Number(body.prepTime) || 0,
      cookTime: Number(body.cookTime) || 0,
      difficulty: body.difficulty || "easy",
      servings: Number(body.servings) || 1,
      status: body.status || "draft",
      videoUrl: body.videoUrl ?? null,
    })
    .returning();

  if (body.macros) {
    await db.insert(macros).values({
      recipeId: recipe.id,
      kcal: Number(body.macros.kcal) || 0,
      protein: Number(body.macros.protein) || 0,
      carbs: Number(body.macros.carbs) || 0,
      fat: Number(body.macros.fat) || 0,
    });
  }

  if (body.ingredients?.length) {
    await db.insert(ingredients).values(
      body.ingredients.map((ing, i) => ({
        recipeId: recipe.id,
        name: ing.name,
        quantity: ing.quantity ? Number(ing.quantity) : null,
        unit: ing.unit ?? null,
        note: ing.note ?? null,
        order: i,
      }))
    );
  }

  if (body.steps?.length) {
    await db.insert(steps).values(
      body.steps.map((step, i) => ({
        recipeId: recipe.id,
        content: step.content,
        order: i + 1,
      }))
    );
  }

  return c.json({ recipe }, 201);
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{
    title?: string;
    slug?: string;
    description?: string;
    prepTime?: number;
    cookTime?: number;
    difficulty?: "easy" | "intermediate" | "hard";
    servings?: number;
    status?: "draft" | "published";
    videoUrl?: string;
    macros?: { kcal: number; protein: number; carbs: number; fat: number };
    ingredients?: Array<{ name: string; quantity?: number; unit?: string; note?: string }>;
    steps?: Array<{ content: string }>;
  }>();

  const [recipe] = await db
    .update(recipes)
    .set({
      ...(body.title && { title: body.title }),
      ...(body.slug && { slug: body.slug }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.prepTime !== undefined && { prepTime: Number(body.prepTime) }),
      ...(body.cookTime !== undefined && { cookTime: Number(body.cookTime) }),
      ...(body.difficulty && { difficulty: body.difficulty }),
      ...(body.servings !== undefined && { servings: Number(body.servings) }),
      ...(body.status && { status: body.status }),
      ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
      updatedAt: new Date(),
    })
    .where(eq(recipes.id, id))
    .returning();

  if (!recipe) return c.json({ error: "Not found" }, 404);

  if (body.macros !== undefined) {
    await db.delete(macros).where(eq(macros.recipeId, id));
    await db.insert(macros).values({
      recipeId: id,
      kcal: Number(body.macros.kcal) || 0,
      protein: Number(body.macros.protein) || 0,
      carbs: Number(body.macros.carbs) || 0,
      fat: Number(body.macros.fat) || 0,
    });
  }

  if (body.ingredients !== undefined) {
    await db.delete(ingredients).where(eq(ingredients.recipeId, id));
    if (body.ingredients.length) {
      await db.insert(ingredients).values(
        body.ingredients.map((ing, i) => ({
          recipeId: id,
          name: ing.name,
          quantity: ing.quantity ? Number(ing.quantity) : null,
          unit: ing.unit ?? null,
          note: ing.note ?? null,
          order: i,
        }))
      );
    }
  }

  if (body.steps !== undefined) {
    await db.delete(steps).where(eq(steps.recipeId, id));
    if (body.steps.length) {
      await db.insert(steps).values(
        body.steps.map((step, i) => ({
          recipeId: id,
          content: step.content,
          order: i + 1,
        }))
      );
    }
  }

  return c.json({ recipe });
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(recipes).where(eq(recipes.id, id));
  return c.json({ ok: true });
});

export default app;
