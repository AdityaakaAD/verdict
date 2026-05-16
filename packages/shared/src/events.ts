// Socket.io event contracts. Spec section 9. Names and payload shapes are
// authoritative — both client and server import from here.

import type {
  Participant,
  ReportReason,
  ResultPayload,
  RevealPayload,
  RoomSnapshot,
  SocketError,
  VoteSide,
} from './types';

// =============================================================================
// Client → Server
// =============================================================================

export interface ClientToServerEvents {
  // Matchmaking
  join_queue: (payload: { region: string }, ack?: AckFn<{ ok: true } | { ok: false; error: string }>) => void;
  leave_queue: () => void;
  // Room lifecycle
  join_room: (payload: { roomId: string }, ack?: AckFn<{ snapshot: RoomSnapshot }>) => void;
  leave_room: (payload: { roomId: string }) => void;
  submit_statement: (
    payload: { roomId: string; text: string },
    ack?: AckFn<{ ok: true } | { ok: false; error: SocketError }>,
  ) => void;
  submit_vote: (
    payload: { roomId: string; vote: VoteSide },
    ack?: AckFn<{ ok: true } | { ok: false; error: SocketError }>,
  ) => void;
  change_vote: (
    payload: { roomId: string; vote: VoteSide },
    ack?: AckFn<{ ok: true } | { ok: false; error: SocketError }>,
  ) => void;
  upvote_statement: (payload: { participantId: string }) => void;
  report: (payload: {
    participantId: string;
    reason: ReportReason;
    details?: string;
  }) => void;
  typing: (payload: { roomId: string; isTyping: boolean }) => void;
}

// =============================================================================
// Server → Client (room-scoped broadcasts)
// =============================================================================

export interface ServerToClientEvents {
  // Matchmaking
  room_ready: (payload: { roomId: string }) => void;
  queue_position: (payload: { position: number; etaMs: number }) => void;
  // Room lifecycle
  room_state: (snapshot: RoomSnapshot) => void;
  player_joined: (payload: { player: Participant }) => void;
  player_left: (payload: { playerId: string }) => void;
  statement_typing: (payload: { participantId: string; isTyping: boolean }) => void;
  statement_submitted: (payload: { participantId: string; text: string }) => void;
  vote_count: (payload: { totalVoted: number; totalPlayers: number }) => void;
  reveal: (payload: RevealPayload) => void;
  conversion_event: (payload: {
    participantId: string;
    fromSide: VoteSide;
    toSide: VoteSide;
  }) => void;
  result: (payload: ResultPayload) => void;
  error: (error: SocketError) => void;
}

export type AckFn<T> = (response: T) => void;

// Convenience names
export const SOCKET_EVENTS = {
  // c2s matchmaking
  JOIN_QUEUE: 'join_queue',
  LEAVE_QUEUE: 'leave_queue',
  // c2s room
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SUBMIT_STATEMENT: 'submit_statement',
  SUBMIT_VOTE: 'submit_vote',
  CHANGE_VOTE: 'change_vote',
  UPVOTE_STATEMENT: 'upvote_statement',
  REPORT: 'report',
  TYPING: 'typing',
  // s2c matchmaking
  ROOM_READY: 'room_ready',
  QUEUE_POSITION: 'queue_position',
  // s2c room
  ROOM_STATE: 'room_state',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  STATEMENT_TYPING: 'statement_typing',
  STATEMENT_SUBMITTED: 'statement_submitted',
  VOTE_COUNT: 'vote_count',
  REVEAL: 'reveal',
  CONVERSION_EVENT: 'conversion_event',
  RESULT: 'result',
  ERROR: 'error',
} as const;
