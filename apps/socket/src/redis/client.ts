import { Redis } from '@upstash/redis';

// Singleton Upstash Redis client. Falls back to an in-memory stub when
// UPSTASH_REDIS_REST_URL is absent (local dev without Redis).
let _redis: Redis | InMemoryRedis | null = null;

export function getRedis(): Redis | InMemoryRedis {
  if (_redis) return _redis;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    console.warn('[redis] No Upstash credentials — using in-memory store (not suitable for production)');
    _redis = new InMemoryRedis();
  }
  return _redis;
}

// Minimal in-memory Redis stand-in for local development.
export class InMemoryRedis {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, opts?: { ex?: number }): Promise<'OK'> {
    this.store.set(key, {
      value,
      expiresAt: opts?.ex ? Date.now() + opts.ex * 1000 : undefined,
    });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const k of keys) {
      if (this.store.delete(k)) count++;
    }
    return count;
  }

  async zadd(key: string, ...args: Array<{ score: number; member: string }>): Promise<number> {
    const set = this._getZSet(key);
    let added = 0;
    for (const { score, member } of args) {
      if (!set.has(member)) added++;
      set.set(member, score);
    }
    this._sets.set(key, set);
    return added;
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    const set = this._getZSet(key);
    let removed = 0;
    for (const m of members) { if (set.delete(m)) removed++; }
    return removed;
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    const set = this._getZSet(key);
    const sorted = [...set.entries()].sort((a, b) => a[1] - b[1]);
    const end = stop < 0 ? sorted.length + stop + 1 : stop + 1;
    return sorted.slice(start, end).map(([m]) => m);
  }

  async zcard(key: string): Promise<number> {
    return this._getZSet(key).size;
  }

  async zpopmin(key: string, count?: number): Promise<string[]> {
    const set = this._getZSet(key);
    const sorted = [...set.entries()].sort((a, b) => a[1] - b[1]);
    const n = count ?? 1;
    const popped: string[] = [];
    for (let i = 0; i < n && i < sorted.length; i++) {
      const [member] = sorted[i]!;
      popped.push(member, String(sorted[i]![1]));
      set.delete(member);
    }
    return popped;
  }

  private _sets = new Map<string, Map<string, number>>();
  private _getZSet(key: string): Map<string, number> {
    if (!this._sets.has(key)) this._sets.set(key, new Map());
    return this._sets.get(key)!;
  }
}
