import 'dotenv/config';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@verdict/shared';
import { STATEMENT_MAX_LENGTH } from '@verdict/shared';
import { verifyToken } from './auth.js';
import { getRoomState, dispatch, initRoom } from './rooms/manager.js';
import { stateToSnapshot } from './rooms/snapshot.js';
import {
  registerSocket,
  unregisterSocket,
  getUser,
  handleJoinQueue,
  handleLeaveQueue,
} from './matchmaking.js';

// Railway injects PORT; fall back to SOCKET_PORT for local dev.
const PORT = Number(process.env.PORT ?? process.env.SOCKET_PORT ?? 4000);
const rawCors = process.env.CORS_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const CORS_ORIGIN: string | string[] = rawCors.includes(',')
  ? rawCors.split(',').map((s) => s.trim())
  : rawCors;

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, ts: Date.now() }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: CORS_ORIGIN, credentials: true },
  transports: ['websocket'],
});

// ---------------------------------------------------------------------------
// Auth middleware — validate Supabase JWT on every connection.
// ---------------------------------------------------------------------------
io.use(async (socket, next) => {
  const token = socket.handshake.auth['token'] as string | undefined;
  if (!token) return next(new Error('unauthorized'));

  const user = await verifyToken(token);
  if (!user) return next(new Error('unauthorized'));

  registerSocket(socket.id, user);
  next();
});

// ---------------------------------------------------------------------------
// Connection handler
// ---------------------------------------------------------------------------
io.on('connection', (socket) => {
  const user = getUser(socket.id);
  if (!user) { socket.disconnect(); return; }

  console.log(`[socket] connected ${user.alias} (${socket.id})`);

  // -------------------------------------------------------------------------
  // Matchmaking
  // -------------------------------------------------------------------------
  socket.on('join_queue', async ({ region }, ack) => {
    await handleJoinQueue(socket, region, io);
    ack?.({ ok: true });
  });

  socket.on('leave_queue', () => {
    handleLeaveQueue(socket, io).catch(console.error);
  });

  // -------------------------------------------------------------------------
  // Room lifecycle
  // -------------------------------------------------------------------------
  socket.on('join_room', async ({ roomId }, ack) => {
    const state = getRoomState(roomId);
    if (!state) {
      ack?.({ snapshot: undefined as any }); // room not found
      socket.emit('error', { code: 'internal', message: 'Room not found.' });
      return;
    }

    socket.join(roomId);

    // Mark participant as connected.
    dispatch(roomId, {
      // We don't have a dedicated "connect" event in the reducer; the
      // room_state broadcast on join is enough to sync the client.
      type: 'tick',
      now: Date.now(),
    }, io);

    ack?.({ snapshot: stateToSnapshot(roomId, state) });
  });

  socket.on('leave_room', ({ roomId }) => {
    socket.leave(roomId);
  });

  // -------------------------------------------------------------------------
  // Game actions
  // -------------------------------------------------------------------------
  socket.on('submit_statement', ({ roomId, text }, ack) => {
    if (text.length > STATEMENT_MAX_LENGTH) {
      ack?.({ ok: false, error: { code: 'statement_too_long', message: 'Statement too long.' } });
      return;
    }

    const state = getRoomState(roomId);
    if (!state || state.phase !== 'statement') {
      ack?.({ ok: false, error: { code: 'phase_mismatch', message: 'Not in statement phase.' } });
      return;
    }

    const participantId = `player_${user.id}`;
    dispatch(roomId, { type: 'submit_statement', participantId, text }, io);
    ack?.({ ok: true });
  });

  socket.on('submit_vote', ({ roomId, vote }, ack) => {
    const state = getRoomState(roomId);
    if (!state || state.phase !== 'voting') {
      ack?.({ ok: false, error: { code: 'phase_mismatch', message: 'Not in voting phase.' } });
      return;
    }

    const participantId = `player_${user.id}`;
    dispatch(roomId, { type: 'submit_vote', participantId, vote }, io);
    ack?.({ ok: true });
  });

  socket.on('change_vote', ({ roomId, vote }, ack) => {
    const state = getRoomState(roomId);
    if (!state || state.phase !== 'conversion') {
      ack?.({ ok: false, error: { code: 'phase_mismatch', message: 'Not in conversion phase.' } });
      return;
    }

    const participantId = `player_${user.id}`;
    dispatch(roomId, { type: 'change_vote', participantId, vote }, io);
    ack?.({ ok: true });
  });

  socket.on('upvote_statement', ({ participantId }) => {
    // Find which room the socket is in.
    const roomId = [...socket.rooms].find((r) => r !== socket.id && !r.startsWith('queue:'));
    if (!roomId) return;

    const voterId = `player_${user.id}`;
    dispatch(roomId, { type: 'upvote_statement', participantId, voterId }, io);
  });

  socket.on('typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('statement_typing', { participantId: `player_${user.id}`, isTyping });
  });

  socket.on('send_rebuttal', ({ roomId, parentParticipantId, text }) => {
    const state = getRoomState(roomId);
    if (!state || state.phase !== 'debate') return;
    io.to(roomId).emit('rebuttal_received', {
      id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      parentParticipantId,
      authorParticipantId: `player_${user.id}`,
      authorAlias: user.alias,
      text: text.slice(0, 300),
    });
  });

  // -------------------------------------------------------------------------
  // Disconnect
  // -------------------------------------------------------------------------
  socket.on('disconnect', () => {
    console.log(`[socket] disconnected ${user.alias}`);
    handleLeaveQueue(socket, io).catch(console.error);
    unregisterSocket(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[verdict/socket] listening on :${PORT} | CORS: ${CORS_ORIGIN}`);
});
