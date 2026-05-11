import { Hono } from "hono";
import { db } from "@cooked/db";
import { tags } from "@cooked/db";

const app = new Hono();

app.get("/", async (c) => {
  const rows = await db.select().from(tags);
  return c.json({ tags: rows });
});

export default app;
