import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";

import { auth } from "./lib/auth.js";
import { rateLimit } from "./middleware/rate-limit.js";
import adminCategoriesRoutes from "./routes/admin/categories.js";
import adminCommentsRoutes from "./routes/admin/comments.js";
import adminRecipesRoutes from "./routes/admin/recipes.js";
import adminUploadRoutes from "./routes/admin/upload.js";
import adminUsersRoutes from "./routes/admin/users.js";
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
  }),
);

app.onError((err, c) => {
  if (err instanceof SyntaxError) {
    return c.json({ error: "Corps de requete invalide" }, 400);
  }
  if (err instanceof z.ZodError) {
    return c.json({ error: "Validation error", details: err.issues }, 400);
  }
  console.error("[API Error]", err);
  return c.json({ error: "Erreur interne" }, 500);
});

app.get("/health", (c) => c.json({ status: "ok" }));
app.use("/uploads/*", serveStatic({ root: "./" }));

app.use("/api/auth/*", rateLimit({ windowMs: 60_000, max: 10 }));
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.route("/api/recipes", recipesRoutes);
app.route("/api/categories", categoriesRoutes);
app.route("/api/tags", tagsRoutes);
app.route("/api/me", meRoutes);
app.route("/api/admin/recipes", adminRecipesRoutes);
app.route("/api/admin/categories", adminCategoriesRoutes);
app.route("/api/admin/comments", adminCommentsRoutes);
app.route("/api/admin/upload", adminUploadRoutes);
app.route("/api/admin/users", adminUsersRoutes);

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`);
});

export type AppType = typeof app;
