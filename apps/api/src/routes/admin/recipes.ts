import { Hono } from "hono";
import { db, recipes, ingredients, steps, macros, medias } from "@cooked/db";
import { desc, eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import { generateSlug } from "../../lib/utils.js";
import {
  createRecipeSchema,
  updateRecipeSchema,
} from "../../lib/validation.js";
import type { AppEnv } from "../../lib/types.js";

const app = new Hono<AppEnv>();
app.use("*", authMiddleware, adminMiddleware);

app.get("/", async (c) => {
  const rows = await db
    .select()
    .from(recipes)
    .orderBy(desc(recipes.createdAt))
    .limit(200);
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
  const raw = await c.req.json();
  const result = createRecipeSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ error: "Validation error", details: result.error.issues }, 400);
  }
  const body = result.data;

  const slug = body.slug || generateSlug(body.title);

  const existing = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(eq(recipes.slug, slug))
    .limit(1);
  if (existing.length > 0) {
    return c.json({ error: "Slug deja utilise" }, 409);
  }

  const [recipe] = await db
    .insert(recipes)
    .values({
      title: body.title,
      slug,
      description: body.description ?? null,
      prepTime: body.prepTime,
      cookTime: body.cookTime,
      difficulty: body.difficulty,
      servings: body.servings,
      status: body.status ?? "draft",
      videoUrl: body.videoUrl ?? null,
    })
    .returning();

  if (body.macros) {
    await db.insert(macros).values({
      recipeId: recipe.id,
      kcal: body.macros.kcal,
      protein: body.macros.protein,
      carbs: body.macros.carbs,
      fat: body.macros.fat,
    });
  }

  if (body.ingredients?.length) {
    await db.insert(ingredients).values(
      body.ingredients.map((ing, i) => ({
        recipeId: recipe.id,
        name: ing.name,
        quantity: ing.quantity ?? null,
        unit: ing.unit ?? null,
        note: ing.note ?? null,
        order: i,
      })),
    );
  }

  if (body.steps?.length) {
    await db.insert(steps).values(
      body.steps.map((step, i) => ({
        recipeId: recipe.id,
        content: step.content,
        order: i + 1,
      })),
    );
  }

  return c.json({ recipe }, 201);
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const raw = await c.req.json();
  const result = updateRecipeSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ error: "Validation error", details: result.error.issues }, 400);
  }
  const body = result.data;

  if (body.slug) {
    const existing = await db
      .select({ id: recipes.id })
      .from(recipes)
      .where(eq(recipes.slug, body.slug))
      .limit(1);
    if (existing.length > 0 && existing[0].id !== id) {
      return c.json({ error: "Slug deja utilise" }, 409);
    }
  }

  const [recipe] = await db
    .update(recipes)
    .set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.prepTime !== undefined && { prepTime: body.prepTime }),
      ...(body.cookTime !== undefined && { cookTime: body.cookTime }),
      ...(body.difficulty !== undefined && { difficulty: body.difficulty }),
      ...(body.servings !== undefined && { servings: body.servings }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
      updatedAt: new Date(),
    })
    .where(eq(recipes.id, id))
    .returning();

  if (!recipe) return c.json({ error: "Not found" }, 404);

  if (body.macros !== undefined) {
    await db.delete(macros).where(eq(macros.recipeId, id));
    if (body.macros) {
      await db.insert(macros).values({
        recipeId: id,
        kcal: body.macros.kcal,
        protein: body.macros.protein,
        carbs: body.macros.carbs,
        fat: body.macros.fat,
      });
    }
  }

  if (body.ingredients !== undefined) {
    await db.delete(ingredients).where(eq(ingredients.recipeId, id));
    if (body.ingredients.length) {
      await db.insert(ingredients).values(
        body.ingredients.map((ing, i) => ({
          recipeId: id,
          name: ing.name,
          quantity: ing.quantity ?? null,
          unit: ing.unit ?? null,
          note: ing.note ?? null,
          order: i,
        })),
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
        })),
      );
    }
  }

  return c.json({ recipe });
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const [deleted] = await db
    .delete(recipes)
    .where(eq(recipes.id, id))
    .returning({ id: recipes.id });
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true });
});

export default app;
