import { Hono } from "hono";
import { db, categories } from "@cooked/db";
import { asc, eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import { generateSlug } from "../../lib/utils.js";

const app = new Hono();
app.use("*", authMiddleware, adminMiddleware);

app.get("/", async (c) => {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.order));
  return c.json({ categories: rows });
});

app.post("/", async (c) => {
  const body = await c.req.json<{
    name: string;
    slug?: string;
    description?: string;
    order?: number;
  }>();

  if (!body.name) return c.json({ error: "Nom requis" }, 400);

  const [category] = await db
    .insert(categories)
    .values({
      name: body.name,
      slug: body.slug || generateSlug(body.name),
      description: body.description ?? null,
      order: Number(body.order) || 0,
    })
    .returning();

  return c.json({ category }, 201);
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{
    name?: string;
    slug?: string;
    description?: string;
    order?: number;
  }>();

  const [category] = await db
    .update(categories)
    .set({
      ...(body.name && { name: body.name }),
      ...(body.slug && { slug: body.slug }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.order !== undefined && { order: Number(body.order) }),
    })
    .where(eq(categories.id, id))
    .returning();

  return c.json({ category });
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(categories).where(eq(categories.id, id));
  return c.json({ ok: true });
});

export default app;
