import type { GameState } from '@verdict/shared';
import { getRedis } from './client.js';

const TTL_SECONDS = 60 * 60 * 24; // 24 h

function key(roomId: string) {
  return `room:${roomId}:state`;
}

export async function saveRoomState(roomId: string, state: GameState): Promise<void> {
  await getRedis().set(key(roomId), JSON.stringify(state), { ex: TTL_SECONDS });
}

export async function loadRoomState(roomId: string): Promise<GameState | null> {
  const raw = await getRedis().get(key(roomId));
  if (!raw) return null;
  return JSON.parse(raw) as GameState;
}

export async function deleteRoomState(roomId: string): Promise<void> {
  await getRedis().del(key(roomId));
}
