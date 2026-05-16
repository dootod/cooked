import { Hono } from "hono";
import { db, categories } from "@cooked/db";
import { asc, eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import { generateSlug } from "../../lib/utils.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../../lib/validation.js";
import type { AppEnv } from "../../lib/types.js";

const app = new Hono<AppEnv>();
app.use("*", authMiddleware, adminMiddleware);

app.get("/", async (c) => {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.order));
  return c.json({ categories: rows });
});

app.post("/", async (c) => {
  const raw = await c.req.json();
  const result = createCategorySchema.safeParse(raw);
  if (!result.success) {
    return c.json({ error: "Validation error", details: result.error.issues }, 400);
  }
  const body = result.data;

  const slug = body.slug || generateSlug(body.name);

  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  if (existing.length > 0) {
    return c.json({ error: "Slug deja utilise" }, 409);
  }

  const [category] = await db
    .insert(categories)
    .values({
      name: body.name,
      slug,
      description: body.description ?? null,
      icon: body.icon ?? "utensils",
      order: body.order ?? 0,
    })
    .returning();

  return c.json({ category }, 201);
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const raw = await c.req.json();
  const result = updateCategorySchema.safeParse(raw);
  if (!result.success) {
    return c.json({ error: "Validation error", details: result.error.issues }, 400);
  }
  const body = result.data;

  if (body.slug) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, body.slug))
      .limit(1);
    if (existing.length > 0 && existing[0].id !== id) {
      return c.json({ error: "Slug deja utilise" }, 409);
    }
  }

  const [category] = await db
    .update(categories)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.icon !== undefined && { icon: body.icon }),
      ...(body.order !== undefined && { order: body.order }),
    })
    .where(eq(categories.id, id))
    .returning();

  if (!category) return c.json({ error: "Not found" }, 404);
  return c.json({ category });
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const [deleted] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning({ id: categories.id });
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true });
});

export default app;
