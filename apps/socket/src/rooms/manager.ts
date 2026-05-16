// In-process room registry. One GameState per active room, with a phase timer.
// Redis is the durable mirror; this Map is the hot path.

import { Server } from 'socket.io';
import {
  createInitialState,
  reduce,
  nextPhase,
  phaseDurationSeconds,
  type GameState,
  type GameEvent,
  type Scenario,
  type ParticipantState,
  type VoteSide,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '@verdict/shared';
import { saveRoomState, deleteRoomState } from '../redis/rooms.js';
import { persistRoundResult } from '../db.js';
import { stateToSnapshot } from './snapshot.js';

interface RoomEntry {
  state: GameState;
  timer: ReturnType<typeof setTimeout> | null;
}

const rooms = new Map<string, RoomEntry>();

type IO = Server<ClientToServerEvents, ServerToClientEvents>;

export function getRoomState(roomId: string): GameState | null {
  return rooms.get(roomId)?.state ?? null;
}

export async function initRoom(opts: {
  roomId: string;
  scenario: Scenario;
  participants: ParticipantState[];
  io: IO;
}): Promise<void> {
  const now = Date.now();
  const state = createInitialState({ scenario: opts.scenario, participants: opts.participants, now });
  rooms.set(opts.roomId, { state, timer: null });
  await saveRoomState(opts.roomId, state);
  scheduleTick(opts.roomId, opts.io);
}

export function dispatch(roomId: string, event: GameEvent, io: IO): GameState | null {
  const entry = rooms.get(roomId);
  if (!entry) return null;

  const next = reduce(entry.state, event);
  entry.state = next;

  // Broadcast updated state to everyone in the room.
  io.to(roomId).emit('room_state', stateToSnapshot(roomId, next));

  // Persist hot state to Redis.
  saveRoomState(roomId, next).catch(console.error);

  return next;
}

function scheduleTick(roomId: string, io: IO): void {
  const entry = rooms.get(roomId);
  if (!entry) return;

  const { state } = entry;
  if (state.phase === 'completed') {
    onRoundComplete(roomId, state, io);
    return;
  }

  const msRemaining = state.phaseEndsAt - Date.now();
  const delay = Math.max(0, msRemaining);

  if (entry.timer) clearTimeout(entry.timer);
  entry.timer = setTimeout(() => {
    const current = rooms.get(roomId);
    if (!current) return;
    const ticked = dispatch(roomId, { type: 'tick', now: Date.now() }, io);
    if (ticked) scheduleTick(roomId, io);
  }, delay + 50); // +50ms to ensure we're past the boundary
}

async function onRoundComplete(roomId: string, state: GameState, io: IO): Promise<void> {
  try {
    await persistRoundResult(roomId, state);
  } catch (err) {
    console.error(`[rooms] Failed to persist round ${roomId}:`, err);
  }
  await deleteRoomState(roomId);
  rooms.delete(roomId);
}

export function closeRoom(roomId: string): void {
  const entry = rooms.get(roomId);
  if (entry?.timer) clearTimeout(entry.timer);
  rooms.delete(roomId);
  deleteRoomState(roomId).catch(console.error);
}
