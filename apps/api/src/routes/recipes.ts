import { Hono } from "hono";
import { db } from "@cooked/db";
import { recipes } from "@cooked/db";
import { eq } from "drizzle-orm";

const app = new Hono();

// GET /api/recipes — liste paginée avec filtres
app.get("/", async (c) => {
  const page = Number(c.req.query("page") ?? 1);
  const limit = Number(c.req.query("limit") ?? 12);
  const offset = (page - 1) * limit;

  const rows = await db
    .select()
    .from(recipes)
    .where(eq(recipes.status, "published"))
    .limit(limit)
    .offset(offset);

  return c.json({ recipes: rows, page, limit });
});

// GET /api/recipes/:slug — détail d'une recette
app.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [recipe] = await db
    .select()
    .from(recipes)
    .where(eq(recipes.slug, slug))
    .limit(1);

  if (!recipe || recipe.status !== "published") {
    return c.json({ error: "Not found" }, 404);
  }

  return c.json({ recipe });
});

export default app;
