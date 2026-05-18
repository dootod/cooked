const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; lockedUntil: number | null; firstAttempt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of attempts) {
    if (val.lockedUntil && val.lockedUntil < now) {
      attempts.delete(key);
    } else if (!val.lockedUntil && now - val.firstAttempt > LOCKOUT_MS) {
      attempts.delete(key);
    }
  }
}, 60_000);

export function isLockedOut(email: string): { locked: boolean; retryAfterSeconds?: number } {
  const key = email.toLowerCase();
  const record = attempts.get(key);
  if (!record?.lockedUntil) return { locked: false };

  const now = Date.now();
  if (record.lockedUntil < now) {
    attempts.delete(key);
    return { locked: false };
  }

  return { locked: true, retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000) };
}

export function recordFailedLogin(email: string): void {
  const key = email.toLowerCase();
  const now = Date.now();
  const record = attempts.get(key);

  if (!record) {
    attempts.set(key, { count: 1, lockedUntil: null, firstAttempt: now });
    return;
  }

  record.count++;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
}

export function clearFailedLogins(email: string): void {
  attempts.delete(email.toLowerCase());
}
