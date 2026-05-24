// Sound event mapping — which game event fires which sound.
// Import this alongside the SoundContext to call play() with typed event names.

export const SOUND_EVENTS = {
  JOIN_ROOM: 'room_ambience',
  PLAYER_JOINED: 'juror_join',
  STATEMENT_SUBMITTED: 'statement_send',
  SUBMIT_VOTE: 'vote_tap',
  VOTE_FLIP: 'flip',
  VERDICT_GONG: 'gong',
  WIN: 'win',
  LOSS: 'loss',
  CONVERSION: 'gong', // louder — caller must set volume override
  TICK: 'tick',
  HEARTBEAT_START: 'heartbeat',
  HEARTBEAT_STOP: 'heartbeat', // caller uses stop()
} as const;

export type SoundEvent = keyof typeof SOUND_EVENTS;
