import type { MiddlewareHandler } from "hono";

const store = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    if (val.resetAt < now) store.delete(key);
  }
}, 60_000);

export function rateLimit(opts: {
  windowMs: number;
  max: number;
}): MiddlewareHandler {
  return async (c, next) => {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      c.req.header("x-real-ip") ??
      "unknown";
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();
    const record = store.get(key);

    if (!record || record.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + opts.windowMs });
      await next();
      return;
    }

    record.count++;

    if (record.count > opts.max) {
      c.header("Retry-After", String(Math.ceil((record.resetAt - now) / 1000)));
      return c.json({ error: "Trop de requetes. Reessayez plus tard." }, 429);
    }

    await next();
  };
}
