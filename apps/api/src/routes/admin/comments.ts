import { Hono } from "hono";
import { db } from "@cooked/db";
import { comments } from "@cooked/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";

const app = new Hono();

app.use("*", authMiddleware, adminMiddleware);

// GET /api/admin/comments — file de modération (pending)
app.get("/", async (c) => {
  const rows = await db
    .select()
    .from(comments)
    .where(eq(comments.status, "pending"));
  return c.json({ comments: rows });
});

// PATCH /api/admin/comments/:id — approuver ou rejeter
app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json<{ status: "approved" | "rejected" }>();

  const [comment] = await db
    .update(comments)
    .set({ status })
    .where(eq(comments.id, id))
    .returning();

  return c.json({ comment });
});

export default app;
