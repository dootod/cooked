import { Hono } from "hono";

const app = new Hono();

// POST /api/auth/register
app.post("/register", async (c) => {
  // TODO: implement with Better Auth
  return c.json({ error: "Not implemented" }, 501);
});

// POST /api/auth/login
app.post("/login", async (c) => {
  // TODO: implement with Better Auth
  return c.json({ error: "Not implemented" }, 501);
});

// POST /api/auth/refresh
app.post("/refresh", async (c) => {
  // TODO: implement with Better Auth
  return c.json({ error: "Not implemented" }, 501);
});

export default app;
