import { Redis } from "@upstash/redis";

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 15 * 60;
const LOCKOUT_MS = LOCKOUT_SECONDS * 1000;

interface LockoutStore {
  isLocked(email: string): Promise<{ locked: boolean; retryAfterSeconds?: number }>;
  recordFailure(email: string): Promise<void>;
  clear(email: string): Promise<void>;
}

class MemoryLockoutStore implements LockoutStore {
  private store = new Map<string, { count: number; lockedUntil: number | null; firstAttempt: number }>();

  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, val] of this.store) {
        if (val.lockedUntil && val.lockedUntil < now) {
          this.store.delete(key);
        } else if (!val.lockedUntil && now - val.firstAttempt > LOCKOUT_MS) {
          this.store.delete(key);
        }
      }
    }, 60_000);
  }

  async isLocked(email: string) {
    const record = this.store.get(email);
    if (!record?.lockedUntil) return { locked: false };

    const now = Date.now();
    if (record.lockedUntil < now) {
      this.store.delete(email);
      return { locked: false };
    }

    return { locked: true, retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000) };
  }

  async recordFailure(email: string) {
    const now = Date.now();
    const record = this.store.get(email);

    if (!record) {
      this.store.set(email, { count: 1, lockedUntil: null, firstAttempt: now });
      return;
    }

    record.count++;
    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
    }
  }

  async clear(email: string) {
    this.store.delete(email);
  }
}

class RedisLockoutStore implements LockoutStore {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  private key(email: string) {
    return `lockout:${email}`;
  }

  async isLocked(email: string) {
    const data = await this.redis.get<{ count: number; lockedUntil: number | null }>(this.key(email));
    if (!data?.lockedUntil) return { locked: false };

    const now = Date.now();
    if (data.lockedUntil < now) {
      await this.redis.del(this.key(email));
      return { locked: false };
    }

    return { locked: true, retryAfterSeconds: Math.ceil((data.lockedUntil - now) / 1000) };
  }

  async recordFailure(email: string) {
    const k = this.key(email);
    const data = await this.redis.get<{ count: number; lockedUntil: number | null }>(k);

    if (!data) {
      await this.redis.set(k, { count: 1, lockedUntil: null }, { ex: LOCKOUT_SECONDS });
      return;
    }

    const newCount = data.count + 1;
    const lockedUntil = newCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
    await this.redis.set(k, { count: newCount, lockedUntil }, { ex: LOCKOUT_SECONDS });
  }

  async clear(email: string) {
    await this.redis.del(this.key(email));
  }
}

let store: LockoutStore | null = null;

function getStore(): LockoutStore {
  if (store) return store;

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    store = new RedisLockoutStore(redis);
    console.log("[Lockout] Using Redis store (Upstash)");
  } else {
    store = new MemoryLockoutStore();
    console.log("[Lockout] Using in-memory store (set UPSTASH_REDIS_REST_URL + TOKEN for Redis)");
  }

  return store;
}

export function isLockedOut(email: string): Promise<{ locked: boolean; retryAfterSeconds?: number }> {
  return getStore().isLocked(email.toLowerCase());
}

export function recordFailedLogin(email: string): Promise<void> {
  return getStore().recordFailure(email.toLowerCase());
}

export function clearFailedLogins(email: string): Promise<void> {
  return getStore().clear(email.toLowerCase());
}
