import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";

const app = new Hono();

app.use("*", authMiddleware);

// GET /api/me
app.get("/", async (c) => {
  // TODO: return authenticated user profile
  return c.json({ user: null });
});

// PUT /api/me
app.put("/", async (c) => {
  // TODO: update profile
  return c.json({ error: "Not implemented" }, 501);
});

// POST /api/me/favorites/:id
app.post("/favorites/:id", async (c) => {
  const id = c.req.param("id");
  // TODO: add to favorites
  return c.json({ ok: true });
});

// DELETE /api/me/favorites/:id
app.delete("/favorites/:id", async (c) => {
  const id = c.req.param("id");
  // TODO: remove from favorites
  return c.json({ ok: true });
});

export default app;
