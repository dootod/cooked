import { Hono } from "hono";
import { db, recipes, ingredients, steps, macros, medias, recipesCategories, recipesTags } from "@cooked/db";
import { and, desc, eq, isNull } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import { generateSlug } from "../../lib/utils.js";
import {
  createRecipeSchema,
  updateRecipeSchema,
} from "../../lib/validation.js";
import { logAudit } from "../../lib/audit.js";
import type { AppEnv } from "../../lib/types.js";

async function withTransaction<T>(fn: (tx: typeof db) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => fn(tx as unknown as typeof db));
}

const app = new Hono<AppEnv>();
app.use("*", authMiddleware, adminMiddleware);

app.get("/", async (c) => {
  const rows = await db
    .select()
    .from(recipes)
    .where(isNull(recipes.deletedAt))
    .orderBy(desc(recipes.createdAt))
    .limit(200);
  return c.json({ recipes: rows });
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), isNull(recipes.deletedAt)))
    .limit(1);

  if (!recipe) return c.json({ error: "Not found" }, 404);

  const [recipeIngredients, recipeSteps, recipeMacro, recipeMedias, recipeCategories, recipeTags] =
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
      db.select({ categoryId: recipesCategories.categoryId }).from(recipesCategories).where(eq(recipesCategories.recipeId, recipe.id)),
      db.select({ tagId: recipesTags.tagId }).from(recipesTags).where(eq(recipesTags.recipeId, recipe.id)),
    ]);

  return c.json({
    recipe: {
      ...recipe,
      ingredients: recipeIngredients,
      steps: recipeSteps,
      macros: recipeMacro[0] ?? null,
      medias: recipeMedias,
      categoryIds: recipeCategories.map((rc) => rc.categoryId),
      tagIds: recipeTags.map((rt) => rt.tagId),
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
  const currentUser = c.get("user");

  const slug = body.slug || generateSlug(body.title);

  const existing = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(eq(recipes.slug, slug))
    .limit(1);
  if (existing.length > 0) {
    return c.json({ error: "Slug deja utilise" }, 409);
  }

  const recipe = await withTransaction(async (tx) => {
    const [created] = await tx
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
      await tx.insert(macros).values({
        recipeId: created.id,
        kcal: body.macros.kcal,
        protein: body.macros.protein,
        carbs: body.macros.carbs,
        fat: body.macros.fat,
      });
    }

    if (body.ingredients?.length) {
      await tx.insert(ingredients).values(
        body.ingredients.map((ing, i) => ({
          recipeId: created.id,
          name: ing.name,
          quantity: ing.quantity ?? null,
          unit: ing.unit ?? null,
          note: ing.note ?? null,
          order: i,
        })),
      );
    }

    if (body.steps?.length) {
      await tx.insert(steps).values(
        body.steps.map((step, i) => ({
          recipeId: created.id,
          content: step.content,
          order: i + 1,
        })),
      );
    }

    if (body.categoryIds?.length) {
      await tx.insert(recipesCategories).values(
        body.categoryIds.map((categoryId) => ({
          recipeId: created.id,
          categoryId,
        })),
      );
    }

    if (body.tagIds?.length) {
      await tx.insert(recipesTags).values(
        body.tagIds.map((tagId) => ({
          recipeId: created.id,
          tagId,
        })),
      );
    }

    if (body.medias?.length) {
      await tx.insert(medias).values(
        body.medias.map((m) => ({
          recipeId: created.id,
          url: m.url,
          alt: m.alt ?? null,
          isPrimary: m.isPrimary ?? false,
        })),
      );
    }

    return created;
  });

  await logAudit({
    userId: currentUser.id,
    action: "recipe.create",
    targetId: recipe.id,
    targetType: "recipe",
  });

  return c.json({ recipe }, 201);
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");
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

  const recipe = await withTransaction(async (tx) => {
    const [updated] = await tx
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
      .where(and(eq(recipes.id, id), isNull(recipes.deletedAt)))
      .returning();

    if (!updated) return null;

    if (body.macros !== undefined) {
      await tx.delete(macros).where(eq(macros.recipeId, id));
      if (body.macros) {
        await tx.insert(macros).values({
          recipeId: id,
          kcal: body.macros.kcal,
          protein: body.macros.protein,
          carbs: body.macros.carbs,
          fat: body.macros.fat,
        });
      }
    }

    if (body.ingredients !== undefined) {
      await tx.delete(ingredients).where(eq(ingredients.recipeId, id));
      if (body.ingredients.length) {
        await tx.insert(ingredients).values(
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
      await tx.delete(steps).where(eq(steps.recipeId, id));
      if (body.steps.length) {
        await tx.insert(steps).values(
          body.steps.map((step, i) => ({
            recipeId: id,
            content: step.content,
            order: i + 1,
          })),
        );
      }
    }

    if (body.categoryIds !== undefined) {
      await tx.delete(recipesCategories).where(eq(recipesCategories.recipeId, id));
      if (body.categoryIds.length) {
        await tx.insert(recipesCategories).values(
          body.categoryIds.map((categoryId) => ({
            recipeId: id,
            categoryId,
          })),
        );
      }
    }

    if (body.tagIds !== undefined) {
      await tx.delete(recipesTags).where(eq(recipesTags.recipeId, id));
      if (body.tagIds.length) {
        await tx.insert(recipesTags).values(
          body.tagIds.map((tagId) => ({
            recipeId: id,
            tagId,
          })),
        );
      }
    }

    if (body.medias !== undefined) {
      await tx.delete(medias).where(eq(medias.recipeId, id));
      if (body.medias.length) {
        await tx.insert(medias).values(
          body.medias.map((m) => ({
            recipeId: id,
            url: m.url,
            alt: m.alt ?? null,
            isPrimary: m.isPrimary ?? false,
          })),
        );
      }
    }

    return updated;
  });

  if (!recipe) return c.json({ error: "Not found" }, 404);

  await logAudit({
    userId: currentUser.id,
    action: "recipe.update",
    targetId: id,
    targetType: "recipe",
  });

  return c.json({ recipe });
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");
  const [deleted] = await db
    .update(recipes)
    .set({ deletedAt: new Date() })
    .where(and(eq(recipes.id, id), isNull(recipes.deletedAt)))
    .returning({ id: recipes.id });
  if (!deleted) return c.json({ error: "Not found" }, 404);

  await logAudit({
    userId: currentUser.id,
    action: "recipe.delete",
    targetId: id,
    targetType: "recipe",
  });

  return c.json({ ok: true });
});

export default app;
