import type { MiddlewareHandler } from "hono";
import { Redis } from "@upstash/redis";

interface RateLimitStore {
  check(
    key: string,
    windowMs: number,
    max: number,
  ): Promise<{ allowed: boolean; retryAfterMs: number }>;
}

class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>();

  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, val] of this.store) {
        if (val.resetAt < now) this.store.delete(key);
      }
    }, 60_000);
  }

  async check(key: string, windowMs: number, max: number) {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || record.resetAt < now) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterMs: 0 };
    }

    record.count++;
    if (record.count > max) {
      return { allowed: false, retryAfterMs: record.resetAt - now };
    }
    return { allowed: true, retryAfterMs: 0 };
  }
}

class RedisStore implements RateLimitStore {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async check(key: string, windowMs: number, max: number) {
    const redisKey = `rl:${key}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(redisKey, 0, windowStart);
    pipeline.zadd(redisKey, { score: now, member: `${now}:${Math.random()}` });
    pipeline.zcard(redisKey);
    pipeline.pexpire(redisKey, windowMs);

    const results = await pipeline.exec();
    const count = results[2] as number;

    if (count > max) {
      return { allowed: false, retryAfterMs: windowMs };
    }
    return { allowed: true, retryAfterMs: 0 };
  }
}

let sharedStore: RateLimitStore | null = null;

function getStore(): RateLimitStore {
  if (sharedStore) return sharedStore;

  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    sharedStore = new RedisStore(redis);
    console.log("[RateLimit] Using Redis store (Upstash)");
  } else {
    sharedStore = new MemoryStore();
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[RateLimit] WARNING: Using in-memory store in production — rate limits are not shared across instances. Set UPSTASH_REDIS_REST_URL + TOKEN for Redis.",
      );
    } else {
      console.log(
        "[RateLimit] Using in-memory store (set UPSTASH_REDIS_REST_URL + TOKEN for Redis)",
      );
    }
  }

  return sharedStore;
}

export function rateLimit(opts: {
  windowMs: number;
  max: number;
  keyFn?: (c: {
    ip: string;
    userId?: string;
    method: string;
    path: string;
  }) => string;
}): MiddlewareHandler {
  return async (c, next) => {
    const store = getStore();
    let ip = "unknown";
    if (process.env.TRUST_PROXY === "true") {
      const realIp = c.req.header("x-real-ip")?.trim();
      if (realIp) {
        ip = realIp;
      } else {
        const forwarded = c.req.header("x-forwarded-for");
        if (forwarded) {
          const parts = forwarded.split(",").map((s) => s.trim());
          const proxyCount = Number(process.env.PROXY_COUNT ?? "1");
          ip = parts[Math.max(0, parts.length - proxyCount)] ?? "unknown";
        }
      }
    } else {
      const info = c.req.raw.headers.get("x-real-ip");
      ip = info || "unknown";
    }
    const userId = c.get("user")?.id as string | undefined;

    const key = opts.keyFn
      ? opts.keyFn({ ip, userId, method: c.req.method, path: c.req.path })
      : `${ip}:${c.req.method}:${c.req.path}`;

    const result = await store.check(key, opts.windowMs, opts.max);

    if (!result.allowed) {
      c.header("Retry-After", String(Math.ceil(result.retryAfterMs / 1000)));
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
