import { Hono } from "hono";
import {
  db,
  recipes,
  ingredients,
  steps,
  macros,
  medias,
  categories,
  tags,
  recipesCategories,
  recipesTags,
  recipesEquipment,
  equipment,
} from "@cooked/db";
import { and, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { paginationSchema } from "../lib/validation.js";

const VALID_DIFFICULTIES = ["easy", "intermediate", "hard"] as const;

const app = new Hono();

app.get("/", async (c) => {
  const { page, limit } = paginationSchema.parse({
    page: c.req.query("page"),
    limit: c.req.query("limit"),
  });
  const offset = (page - 1) * limit;
  const search = c.req.query("search")?.slice(0, 200);
  const categorySlug = c.req.query("category");
  const tagSlug = c.req.query("tag");
  const difficulty = c.req.query("difficulty");
  const sort = c.req.query("sort") ?? "recent";

  const conditions = [eq(recipes.status, "published")];

  if (search) {
    conditions.push(ilike(recipes.title, `%${search}%`));
  }
  if (difficulty && VALID_DIFFICULTIES.includes(difficulty as typeof VALID_DIFFICULTIES[number])) {
    conditions.push(eq(recipes.difficulty, difficulty as "easy" | "intermediate" | "hard"));
  }

  let recipeIds: string[] | null = null;

  if (categorySlug) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);
    if (cat) {
      const catRecipes = await db
        .select({ recipeId: recipesCategories.recipeId })
        .from(recipesCategories)
        .where(eq(recipesCategories.categoryId, cat.id));
      recipeIds = catRecipes.map((r) => r.recipeId);
    } else {
      return c.json({ recipes: [], page, limit, total: 0 });
    }
  }

  if (tagSlug) {
    const [tag] = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, tagSlug))
      .limit(1);
    if (tag) {
      const tagRecipes = await db
        .select({ recipeId: recipesTags.recipeId })
        .from(recipesTags)
        .where(eq(recipesTags.tagId, tag.id));
      const ids = tagRecipes.map((r) => r.recipeId);
      recipeIds = recipeIds ? recipeIds.filter((id) => ids.includes(id)) : ids;
    } else {
      return c.json({ recipes: [], page, limit, total: 0 });
    }
  }

  if (recipeIds !== null) {
    if (recipeIds.length === 0) {
      return c.json({ recipes: [], page, limit, total: 0 });
    }
    conditions.push(inArray(recipes.id, recipeIds));
  }

  const where = and(...conditions);

  const orderBy =
    sort === "prep_asc"
      ? sql`${recipes.prepTime} + ${recipes.cookTime} ASC`
      : desc(recipes.createdAt);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(recipes)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(recipes).where(where),
  ]);

  if (rows.length === 0) {
    return c.json({ recipes: [], page, limit, total: 0 });
  }

  const ids = rows.map((r) => r.id);

  const [primaryMedias, recipeMacros, recipeCategories, recipeTags] =
    await Promise.all([
      db
        .select()
        .from(medias)
        .where(and(inArray(medias.recipeId, ids), eq(medias.isPrimary, true))),
      db.select().from(macros).where(inArray(macros.recipeId, ids)),
      db
        .select({
          recipeId: recipesCategories.recipeId,
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(recipesCategories)
        .innerJoin(categories, eq(recipesCategories.categoryId, categories.id))
        .where(inArray(recipesCategories.recipeId, ids)),
      db
        .select({
          recipeId: recipesTags.recipeId,
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(recipesTags)
        .innerJoin(tags, eq(recipesTags.tagId, tags.id))
        .where(inArray(recipesTags.recipeId, ids)),
    ]);

  const enriched = rows.map((recipe) => ({
    ...recipe,
    primaryMedia: primaryMedias.find((m) => m.recipeId === recipe.id) ?? null,
    macros: recipeMacros.find((m) => m.recipeId === recipe.id) ?? null,
    categories: recipeCategories.filter((rc) => rc.recipeId === recipe.id),
    tags: recipeTags.filter((t) => t.recipeId === recipe.id),
  }));

  return c.json({ recipes: enriched, page, limit, total });
});

app.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.slug, slug), eq(recipes.status, "published")))
    .limit(1);

  if (!recipe) return c.json({ error: "Not found" }, 404);

  const [
    recipeIngredients,
    recipeSteps,
    recipeMacro,
    recipeMedias,
    recipeCategories,
    recipeTags,
    recipeEquipment,
  ] = await Promise.all([
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
    db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(recipesCategories)
      .innerJoin(categories, eq(recipesCategories.categoryId, categories.id))
      .where(eq(recipesCategories.recipeId, recipe.id)),
    db
      .select({ id: tags.id, name: tags.name, slug: tags.slug })
      .from(recipesTags)
      .innerJoin(tags, eq(recipesTags.tagId, tags.id))
      .where(eq(recipesTags.recipeId, recipe.id)),
    db
      .select({
        id: equipment.id,
        name: equipment.name,
        iconSlug: equipment.iconSlug,
      })
      .from(recipesEquipment)
      .innerJoin(equipment, eq(recipesEquipment.equipmentId, equipment.id))
      .where(eq(recipesEquipment.recipeId, recipe.id)),
  ]);

  return c.json({
    recipe: {
      ...recipe,
      ingredients: recipeIngredients,
      steps: recipeSteps,
      macros: recipeMacro[0] ?? null,
      medias: recipeMedias,
      categories: recipeCategories,
      tags: recipeTags,
      equipment: recipeEquipment,
    },
  });
});

export default app;
