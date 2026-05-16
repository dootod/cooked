import { Hono } from "hono";
import { db, comments } from "@cooked/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";
import { commentStatusSchema } from "../../lib/validation.js";
import { logAudit } from "../../lib/audit.js";
import type { AppEnv } from "../../lib/types.js";

const app = new Hono<AppEnv>();

app.use("*", authMiddleware, adminMiddleware);

app.get("/", async (c) => {
  const rows = await db
    .select()
    .from(comments)
    .where(eq(comments.status, "pending"));
  return c.json({ comments: rows });
});

app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const currentUser = c.get("user");
  const raw = await c.req.json();
  const result = commentStatusSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ error: "Status doit etre 'approved' ou 'rejected'" }, 400);
  }

  const [comment] = await db
    .update(comments)
    .set({ status: result.data.status })
    .where(eq(comments.id, id))
    .returning();

  if (!comment) return c.json({ error: "Not found" }, 404);

  await logAudit({
    userId: currentUser.id,
    action: result.data.status === "approved" ? "comment.approve" : "comment.reject",
    targetId: id,
    targetType: "comment",
  });

  return c.json({ comment });
});

export default app;
