import { Hono } from "hono";
import { db } from "@cooked/db";
import { recipes } from "@cooked/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";

const app = new Hono();

app.use("*", authMiddleware, adminMiddleware);

// GET /api/admin/recipes — toutes recettes (brouillons inclus)
app.get("/", async (c) => {
  const rows = await db.select().from(recipes);
  return c.json({ recipes: rows });
});

// POST /api/admin/recipes
app.post("/", async (c) => {
  const body = await c.req.json();
  // TODO: validate body with zod
  const [recipe] = await db.insert(recipes).values(body).returning();
  return c.json({ recipe }, 201);
});

// PUT /api/admin/recipes/:id
app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [recipe] = await db
    .update(recipes)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(recipes.id, id))
    .returning();
  return c.json({ recipe });
});

// DELETE /api/admin/recipes/:id
app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(recipes).where(eq(recipes.id, id));
  return c.json({ ok: true });
});

export default app;
