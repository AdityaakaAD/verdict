// Quick Match matchmaking. Collects players from the queue, backfills with
// bots if needed, creates the room, and notifies all participants.

import type { Server, Socket } from 'socket.io';
import type { ParticipantState, ClientToServerEvents, ServerToClientEvents } from '@verdict/shared';
import { AVATAR_IDS, TIERS } from '@verdict/shared';
import { enqueue, dequeue, popFront, queueLength } from './redis/queue.js';
import { backfillBots } from './bots/index.js';
import { initRoom } from './rooms/manager.js';
import { createRoomInDb, pickScenario, rowToScenario } from './db.js';
import type { AuthUser } from './auth.js';

type IO = Server<ClientToServerEvents, ServerToClientEvents>;

// Socket ID → AuthUser map for fast lookups in the socket event handlers.
const socketUsers = new Map<string, AuthUser>();
// UserId → socketId map so matchmaking can notify specific sockets.
const userSockets = new Map<string, string>();

export function registerSocket(socketId: string, user: AuthUser): void {
  socketUsers.set(socketId, user);
  userSockets.set(user.id, socketId);
}

export function unregisterSocket(socketId: string): void {
  const user = socketUsers.get(socketId);
  if (user) userSockets.delete(user.id);
  socketUsers.delete(socketId);
}

export function getUser(socketId: string): AuthUser | undefined {
  return socketUsers.get(socketId);
}

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 6; // Start the game when we have this many real players
const QUEUE_POLL_MS = 3_000;
const QUEUE_TIMEOUT_MS = 30_000; // After 30s, backfill with bots and start

// Per-region timers.
const regionTimers = new Map<string, ReturnType<typeof setTimeout>>();

export async function handleJoinQueue(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  region: string,
  io: IO,
): Promise<void> {
  const user = getUser(socket.id);
  if (!user) return;

  await enqueue(user.id, region);
  socket.join(`queue:${region}`);

  // Start a polling loop for this region if not already running.
  if (!regionTimers.has(region)) {
    scheduleMatchCheck(region, io);
  }
}

export async function handleLeaveQueue(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: IO,
): Promise<void> {
  const user = getUser(socket.id);
  if (!user) return;
  // We don't know which region they were in — search all queues would be expensive.
  // The queue entry will naturally expire when the user disconnects.
  socket.rooms.forEach((room) => {
    if (room.startsWith('queue:')) {
      const region = room.slice('queue:'.length);
      dequeue(user.id, region).catch(console.error);
      socket.leave(room);
    }
  });
}

function scheduleMatchCheck(region: string, io: IO): void {
  const timer = setTimeout(async () => {
    regionTimers.delete(region);
    await tryCreateMatch(region, io);
    // Re-schedule if there are still players waiting.
    const remaining = await queueLength(region);
    if (remaining > 0) scheduleMatchCheck(region, io);
  }, QUEUE_POLL_MS);
  regionTimers.set(region, timer);
}

async function tryCreateMatch(region: string, io: IO): Promise<void> {
  const length = await queueLength(region);
  if (length < MIN_PLAYERS) return; // Not enough players yet.

  const count = Math.min(length, MAX_PLAYERS);
  const userIds = await popFront(region, count);
  if (userIds.length === 0) return;

  // Build participant list from real players + bot backfill.
  const realParticipants: ParticipantState[] = userIds.map((uid, i) => ({
    id: `player_${uid}`,
    userId: uid,
    isBot: false,
    botPersona: null,
    alias: socketUsers.get(userSockets.get(uid) ?? '')?.alias ?? `player${i}`,
    avatarId: AVATAR_IDS[i % AVATAR_IDS.length]!,
    tier: (socketUsers.get(userSockets.get(uid) ?? '')?.tier as typeof TIERS[number]['id']) ?? 'citizen',
    statement: null,
    vote: null,
    initialVote: null,
    changedVoteDuringConversion: false,
    wasMinority: null,
    conversionsMade: 0,
    statementUpvotes: 0,
    scoreDelta: 0,
    isConnected: true,
  }));

  const participants = backfillBots(realParticipants, MIN_PLAYERS);

  // Pick a scenario.
  const scenarioData = await pickScenario(region);
  if (!scenarioData) {
    console.error('[matchmaking] No scenario available');
    return;
  }
  const scenario = rowToScenario(scenarioData.row as Record<string, unknown>);

  // Create the room in Supabase.
  const roomId = await createRoomInDb({
    scenarioId: scenario.id,
    type: 'quick_match',
    region,
    participants,
  });

  // Initialise the room in the manager.
  await initRoom({ roomId, scenario, participants, io });

  // Notify real players to navigate to the room.
  for (const uid of userIds) {
    const socketId = userSockets.get(uid);
    if (socketId) {
      io.to(socketId).emit('room_ready', { roomId });
    }
  }

  console.log(`[matchmaking] Created room ${roomId} for ${userIds.length} players in ${region}`);
}
