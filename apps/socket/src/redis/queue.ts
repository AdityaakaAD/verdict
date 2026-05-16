import { getRedis } from './client.js';

// Matchmaking queue per region — sorted set scored by join timestamp.
function queueKey(region: string) {
  return `match:queue:${region}`;
}

export async function enqueue(userId: string, region: string): Promise<void> {
  await getRedis().zadd(queueKey(region), { score: Date.now(), member: userId });
}

export async function dequeue(userId: string, region: string): Promise<void> {
  await getRedis().zrem(queueKey(region), userId);
}

/** Pop up to `count` oldest entries from the queue. Returns userIds. */
export async function popFront(region: string, count: number): Promise<string[]> {
  const result = await getRedis().zpopmin(queueKey(region), count * 2);
  // zpopmin returns [member, score, member, score, ...]
  const members: string[] = [];
  for (let i = 0; i < result.length; i += 2) {
    if (result[i]) members.push(result[i]!);
  }
  return members;
}

export async function queueLength(region: string): Promise<number> {
  return getRedis().zcard(queueKey(region));
}

export async function queuePosition(userId: string, region: string): Promise<number> {
  const all = await getRedis().zrange(queueKey(region), 0, -1);
  const pos = all.indexOf(userId);
  return pos === -1 ? -1 : pos + 1;
}
