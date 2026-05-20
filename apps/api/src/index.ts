import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";

import { auth } from "./lib/auth.js";
import {
  isLockedOut,
  recordFailedLogin,
  clearFailedLogins,
} from "./lib/account-lockout.js";
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
import commentsRoutes from "./routes/comments.js";
import tagsRoutes from "./routes/tags.js";

function formatZodErrors(issues: z.ZodIssue[]): string[] {
  return issues.map((i) => `${i.path.join(".")}: ${i.message}`);
}

const app = new Hono();

if (process.env.NODE_ENV !== "production") {
  app.use("*", logger());
}
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "0");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    c.header(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains",
    );
  }
});
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

for (const origin of allowedOrigins) {
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new Error(`Invalid protocol: ${u.protocol}`);
    }
    if (u.hostname.includes("*")) {
      throw new Error("Wildcard origins not allowed with credentials");
    }
  } catch (e) {
    console.error(`[CORS] Invalid origin "${origin}":`, (e as Error).message);
    process.exit(1);
  }
}

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  const method = c.req.method;
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const origin = c.req.header("origin");
    if (origin && !allowedOrigins.includes(origin)) {
      return c.json({ error: "Origin non autorisee" }, 403);
    }
  }
  await next();
});

app.use(
  "/api/admin/upload/*",
  bodyLimit({
    maxSize: 6 * 1024 * 1024,
    onError: (c) => c.json({ error: "Payload trop volumineux" }, 413),
  }),
);
app.use(
  "*",
  bodyLimit({
    maxSize: 1024 * 1024,
    onError: (c) => c.json({ error: "Payload trop volumineux" }, 413),
  }),
);

app.onError((err, c) => {
  if (err instanceof SyntaxError) {
    return c.json({ error: "Corps de requete invalide" }, 400);
  }
  if (err instanceof z.ZodError) {
    return c.json(
      {
        error: "Validation error",
        ...(process.env.NODE_ENV !== "production" && {
          details: formatZodErrors(err.issues),
        }),
      },
      400,
    );
  }
  if (process.env.NODE_ENV === "production") {
    console.error("[API Error]", err.message);
  } else {
    console.error("[API Error]", err);
  }
  return c.json({ error: "Erreur interne" }, 500);
});

app.get("/health", (c) => c.json({ status: "ok" }));
app.use("/uploads/*", async (c, next) => {
  if (c.req.path.includes("..")) {
    return c.json({ error: "Forbidden" }, 403);
  }
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Content-Security-Policy", "default-src 'none'; img-src 'self'");
  c.header("Cache-Control", "public, max-age=31536000, immutable");
  await next();
});
app.use(
  "/uploads/*",
  serveStatic({
    root: "./uploads",
    rewriteRequestPath: (p) => p.replace(/^\/uploads/, ""),
  }),
);

const signUpLimit = rateLimit({ windowMs: 60_000, max: 3 });
app.post("/api/auth/sign-up/email", signUpLimit);

const authReadLimit = rateLimit({ windowMs: 60_000, max: 120 });
const authWriteLimit = rateLimit({ windowMs: 60_000, max: 10 });
app.use("/api/auth/*", (c, next) =>
  c.req.method === "GET" || c.req.method === "HEAD"
    ? authReadLimit(c, next)
    : authWriteLimit(c, next),
);
app.post("/api/auth/sign-in/email", async (c) => {
  const cloned = c.req.raw.clone();
  let body: { email?: string } = {};
  try {
    body = (await cloned.json()) as { email?: string };
  } catch {
    // let auth.handler deal with bad body
  }

  const email = body.email ?? "";
  if (email) {
    const lockout = await isLockedOut(email);
    if (lockout.locked) {
      return c.json(
        {
          error:
            "Compte temporairement verrouille. Reessayez dans " +
            lockout.retryAfterSeconds +
            " secondes.",
        },
        429,
      );
    }
  }

  const response = await auth.handler(c.req.raw);

  if (!response.ok && email) {
    await recordFailedLogin(email);
  } else if (response.ok && email) {
    await clearFailedLogins(email);
  }

  return response;
});
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

const publicRateLimit = rateLimit({ windowMs: 60_000, max: 100 });
app.use("/api/recipes", publicRateLimit);
app.use("/api/recipes/*", publicRateLimit);
app.use("/api/categories", publicRateLimit);
app.use("/api/categories/*", publicRateLimit);
app.use("/api/tags", publicRateLimit);
app.use("/api/tags/*", publicRateLimit);
app.route("/api/recipes", recipesRoutes);
app.route("/api/recipes", commentsRoutes);
app.route("/api/categories", categoriesRoutes);
app.route("/api/tags", tagsRoutes);
const meRateLimit = userRateLimit({ windowMs: 60_000, max: 30 });
app.use("/api/me", meRateLimit);
app.use("/api/me/*", meRateLimit);
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
