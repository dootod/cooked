import { Hono } from "hono";
import { db, tags, recipesTags } from "@cooked/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import { generateSlug } from "../../lib/utils.js";
import type { AppEnv } from "../../lib/types.js";

const tagSchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  slug: z.string().max(100).optional(),
});

const app = new Hono<AppEnv>();
app.use("*", authMiddleware, adminMiddleware);

app.get("/", async (c) => {
  const rows = await db.select().from(tags);
  return c.json({ tags: rows });
});

app.post("/", async (c) => {
  const raw = await c.req.json();
  const result = tagSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ error: "Validation error", details: result.error.issues }, 400);
  }
  const body = result.data;
  const slug = body.slug || generateSlug(body.name);

  const existing = await db
    .select({ id: tags.id })
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);
  if (existing.length > 0) {
    return c.json({ error: "Slug deja utilise" }, 409);
  }

  const [tag] = await db
    .insert(tags)
    .values({ name: body.name, slug })
    .returning();

  return c.json({ tag }, 201);
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const raw = await c.req.json();
  const result = tagSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ error: "Validation error", details: result.error.issues }, 400);
  }
  const body = result.data;
  const slug = body.slug || generateSlug(body.name);

  const existing = await db
    .select({ id: tags.id })
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);
  if (existing.length > 0 && existing[0].id !== id) {
    return c.json({ error: "Slug deja utilise" }, 409);
  }

  const [updated] = await db
    .update(tags)
    .set({ name: body.name, slug })
    .where(eq(tags.id, id))
    .returning();

  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json({ tag: updated });
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(recipesTags).where(eq(recipesTags.tagId, id));
  const [deleted] = await db
    .delete(tags)
    .where(eq(tags.id, id))
    .returning({ id: tags.id });
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true });
});

export default app;
