import type { ParticipantState, VoteSide } from '@verdict/shared';
import { AVATAR_IDS } from '@verdict/shared';

const BOT_PERSONAS = [
  'devil_advocate', 'pragmatist', 'idealist', 'contrarian', 'centrist',
] as const;

const BOT_ALIASES = [
  'axiom', 'cipher', 'delta', 'echo', 'folio',
  'glyph', 'haven', 'iota', 'kestrel', 'lumen',
] as const;

let botCounter = 0;

/** Create a bot participant. Side is assigned randomly if not provided. */
export function createBot(overrides?: { vote?: VoteSide }): ParticipantState {
  const idx = botCounter++ % BOT_ALIASES.length;
  const vote: VoteSide = overrides?.vote ?? (Math.random() < 0.5 ? 'a' : 'b');
  return {
    id: `bot_${Date.now()}_${idx}`,
    userId: null,
    isBot: true,
    botPersona: BOT_PERSONAS[idx % BOT_PERSONAS.length]!,
    alias: BOT_ALIASES[idx]!,
    avatarId: AVATAR_IDS[idx % AVATAR_IDS.length]!,
    tier: 'citizen',
    statement: null,
    vote,
    initialVote: null,
    changedVoteDuringConversion: false,
    wasMinority: null,
    conversionsMade: 0,
    statementUpvotes: 0,
    scoreDelta: 0,
    isConnected: true,
  };
}

/** Fill a participant list to `targetCount` with bots to ensure the game can start. */
export function backfillBots(
  participants: ParticipantState[],
  targetCount: number,
): ParticipantState[] {
  const result = [...participants];
  while (result.length < targetCount) {
    result.push(createBot());
  }
  return result;
}
