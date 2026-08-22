/**
 * In-memory rate limiter with per-key cooldown window.
 * Useful for microcontrollers and IoT devices to prevent accidental sensor bounce,
 * duplicate triggers, or flood attacks.
 */

interface RateLimitRecord {
  lastTimestamp: number;
  requestCount: number;
}

class RateLimiter {
  private cache = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * @param windowMs Cooldown / rate limit window in milliseconds (default 10,000ms = 10s)
   * @param maxRequests Maximum requests allowed within the window (default 1)
   */
  constructor(windowMs = 10_000, maxRequests = 1) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Periodic cleanup of stale entries every 60 seconds
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 60_000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Check whether an action for a given identifier is permitted.
   * If permitted, records the timestamp.
   *
   * @param key Identifier such as device_id or IP address
   * @returns Object with `allowed`, `remainingMs`, and `retryAfterSeconds`
   */
  public check(key: string): { allowed: boolean; remainingMs: number; retryAfterSeconds: number } {
    const now = Date.now();
    const record = this.cache.get(key);

    if (!record) {
      this.cache.set(key, { lastTimestamp: now, requestCount: 1 });
      return { allowed: true, remainingMs: 0, retryAfterSeconds: 0 };
    }

    const elapsed = now - record.lastTimestamp;

    if (elapsed < this.windowMs) {
      if (record.requestCount >= this.maxRequests) {
        const remainingMs = this.windowMs - elapsed;
        return {
          allowed: false,
          remainingMs,
          retryAfterSeconds: Math.ceil(remainingMs / 1000),
        };
      }
      record.requestCount += 1;
      return { allowed: true, remainingMs: 0, retryAfterSeconds: 0 };
    }

    // Window elapsed, reset bucket
    this.cache.set(key, { lastTimestamp: now, requestCount: 1 });
    return { allowed: true, remainingMs: 0, retryAfterSeconds: 0 };
  }

  /**
   * Reset rate limit state for a key (useful for tests)
   */
  public reset(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.cache.entries()) {
      if (now - record.lastTimestamp > this.windowMs * 2) {
        this.cache.delete(key);
      }
    }
  }
}

// Global instance: 10s cooldown window per device/IP
export const iotRateLimiter = new RateLimiter(10_000, 1);
export { RateLimiter };
