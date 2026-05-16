import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";

import { auth } from "./lib/auth.js";
import { rateLimit, userRateLimit } from "./middleware/rate-limit.js";
import adminCategoriesRoutes from "./routes/admin/categories.js";
import adminCommentsRoutes from "./routes/admin/comments.js";
import adminRecipesRoutes from "./routes/admin/recipes.js";
import adminUploadRoutes from "./routes/admin/upload.js";
import adminUsersRoutes from "./routes/admin/users.js";
import adminCleanupRoutes from "./routes/admin/cleanup.js";
import adminTagsRoutes from "./routes/admin/tags.js";
import categoriesRoutes from "./routes/categories.js";
import meRoutes from "./routes/me.js";
import recipesRoutes from "./routes/recipes.js";
import tagsRoutes from "./routes/tags.js";

const app = new Hono();

app.use("*", logger());
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "0");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
});
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  "*",
  cors({
    origin: allowedOrigins,
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
app.use("/uploads/*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Content-Security-Policy", "default-src 'none'; img-src 'self'");
  c.header("Cache-Control", "public, max-age=31536000, immutable");
  await next();
});
app.use("/uploads/*", serveStatic({ root: "./" }));

app.use("/api/auth/*", rateLimit({ windowMs: 60_000, max: 10 }));
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use("/api/recipes/*", rateLimit({ windowMs: 60_000, max: 100 }));
app.use("/api/categories/*", rateLimit({ windowMs: 60_000, max: 100 }));
app.use("/api/tags/*", rateLimit({ windowMs: 60_000, max: 100 }));
app.route("/api/recipes", recipesRoutes);
app.route("/api/categories", categoriesRoutes);
app.route("/api/tags", tagsRoutes);
app.use("/api/me/*", userRateLimit({ windowMs: 60_000, max: 30 }));
app.route("/api/me", meRoutes);

app.use("/api/admin/upload/*", rateLimit({ windowMs: 60_000, max: 20 }));
app.use("/api/admin/*", rateLimit({ windowMs: 60_000, max: 60 }));
app.route("/api/admin/recipes", adminRecipesRoutes);
app.route("/api/admin/categories", adminCategoriesRoutes);
app.route("/api/admin/comments", adminCommentsRoutes);
app.route("/api/admin/upload", adminUploadRoutes);
app.route("/api/admin/users", adminUsersRoutes);
app.route("/api/admin/tags", adminTagsRoutes);
app.route("/api/admin/cleanup", adminCleanupRoutes);

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`);
});

export type AppType = typeof app;
