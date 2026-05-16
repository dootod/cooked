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
  keyFn?: (c: { ip: string; userId?: string; method: string; path: string }) => string;
}): MiddlewareHandler {
  return async (c, next) => {
    const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    const realIp = c.req.header("x-real-ip");
    const ip = forwarded || realIp || "unknown";
    const userId = c.get("user")?.id as string | undefined;

    const key = opts.keyFn
      ? opts.keyFn({ ip, userId, method: c.req.method, path: c.req.path })
      : `${ip}:${c.req.method}:${c.req.path}`;

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

export function userRateLimit(opts: {
  windowMs: number;
  max: number;
}): MiddlewareHandler {
  return rateLimit({
    ...opts,
    keyFn: ({ ip, userId, method, path }) => {
      const id = userId ?? ip;
      return `user:${id}:${method}:${path}`;
    },
  });
}
