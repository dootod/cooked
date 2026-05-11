import { Hono } from "hono";
import { db } from "@cooked/db";
import { categories } from "@cooked/db";
import { asc } from "drizzle-orm";

const app = new Hono();

app.get("/", async (c) => {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.order));
  return c.json({ categories: rows });
});

export default app;
