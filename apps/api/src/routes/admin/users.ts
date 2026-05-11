import { Hono } from "hono";
import { db } from "@cooked/db";
import { users } from "@cooked/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth.js";
import { adminMiddleware } from "../../middleware/admin.js";

const app = new Hono();

app.use("*", authMiddleware, adminMiddleware);

// GET /api/admin/users
app.get("/", async (c) => {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      role: users.role,
      suspended: users.suspended,
      createdAt: users.createdAt,
    })
    .from(users);
  return c.json({ users: rows });
});

// PATCH /api/admin/users/:id — suspendre / modifier
app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [user] = await db
    .update(users)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return c.json({ user });
});

export default app;
