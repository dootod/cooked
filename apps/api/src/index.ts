import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import adminCommentsRoutes from "./routes/admin/comments.js";
import adminRecipesRoutes from "./routes/admin/recipes.js";
import adminUsersRoutes from "./routes/admin/users.js";
import authRoutes from "./routes/auth.js";
import categoriesRoutes from "./routes/categories.js";
import meRoutes from "./routes/me.js";
import recipesRoutes from "./routes/recipes.js";
import tagsRoutes from "./routes/tags.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/api/recipes", recipesRoutes);
app.route("/api/categories", categoriesRoutes);
app.route("/api/tags", tagsRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/me", meRoutes);
app.route("/api/admin/recipes", adminRecipesRoutes);
app.route("/api/admin/comments", adminCommentsRoutes);
app.route("/api/admin/users", adminUsersRoutes);

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`);
});

export type AppType = typeof app;
