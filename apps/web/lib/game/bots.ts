// Bot personas + scripted behaviour for practice mode.
//
// The persona system has two jobs:
//   1. Give each bot a recognisable "voice" so statements feel like five
//      different jurors, not five copies of the same script.
//   2. Pick a side. In practice mode we deterministically seed the user
//      onto the minority — the spec says the tutorial round is rigged so
//      the user feels the conversion mechanic land. We bias four bots to
//      one side and leave one swing bot the user can flip in debate.
//
// All copy here is editorial-tone, no emoji, no exclamation marks, no
// real names. Statements are templated so the same persona reads
// consistently across scenarios.

import type { AvatarId, ParticipantState, Scenario, VoteSide } from '@verdict/shared';

export interface BotPersona {
  id: string;
  alias: string;
  avatarId: AvatarId;
  /** How a persona reasons about scenarios. Drives statement templates. */
  voice: 'principled' | 'pragmatic' | 'cynical' | 'compassionate' | 'contrarian';
}

export const PRACTICE_BOTS: BotPersona[] = [
  { id: 'bot_1', alias: 'anonymous_juror_a', avatarId: 'triangle', voice: 'principled' },
  { id: 'bot_2', alias: 'anonymous_juror_b', avatarId: 'square', voice: 'pragmatic' },
  { id: 'bot_3', alias: 'anonymous_juror_c', avatarId: 'hexagon', voice: 'cynical' },
  { id: 'bot_4', alias: 'anonymous_juror_d', avatarId: 'crescent', voice: 'compassionate' },
  { id: 'bot_5', alias: 'anonymous_juror_e', avatarId: 'diamond', voice: 'contrarian' },
];

// -----------------------------------------------------------------------------
// Statement templates
// -----------------------------------------------------------------------------

const TEMPLATES: Record<BotPersona['voice'], Record<VoteSide, string[]>> = {
  principled: {
    a: [
      'The principle is the principle. {sideA} is the only honest read.',
      'You do not get to choose when rules apply. {sideA}.',
    ],
    b: [
      'A principle that ignores consequence is not a principle. {sideB}.',
      'Rules without judgment fail the people they were written for. {sideB}.',
    ],
  },
  pragmatic: {
    a: [
      'I would not have done it. But it worked, and it had to. {sideA}.',
      'Look at what would have happened otherwise. {sideA}.',
    ],
    b: [
      'The cost outweighed the gain. {sideB}.',
      'A short-term win that breaks the long-term system is a loss. {sideB}.',
    ],
  },
  cynical: {
    a: [
      'Of course it was. Everyone in that position would do the same. {sideA}.',
      'People defend the move because the alternative is worse. {sideA}.',
    ],
    b: [
      'I have heard this defence too many times to take it seriously. {sideB}.',
      'This is a story the powerful tell to feel better. {sideB}.',
    ],
  },
  compassionate: {
    a: [
      'Walk a mile in that life before you judge. {sideA}.',
      'There is more here than the obvious read. {sideA}.',
    ],
    b: [
      'I keep thinking about the person who didn’t get a vote. {sideB}.',
      'Compassion runs both ways. {sideB}.',
    ],
  },
  contrarian: {
    a: [
      'Everyone is going to say the opposite. I am with {sideA} anyway.',
      'The easy answer is wrong here. {sideA}.',
    ],
    b: [
      'The room is wrong. {sideB}.',
      'I do not buy the consensus on this one. {sideB}.',
    ],
  },
};

function pickTemplate(seed: number, options: string[]): string {
  const idx = Math.abs(seed) % options.length;
  return options[idx]!;
}

export function botStatement(
  persona: BotPersona,
  scenario: Scenario,
  side: VoteSide,
  seed: number,
): string {
  const template = pickTemplate(seed, TEMPLATES[persona.voice][side]);
  const sideA = scenario.sideALabel.toLowerCase();
  const sideB = scenario.sideBLabel.toLowerCase();
  return template.replace('{sideA}', sideA).replace('{sideB}', sideB);
}

// -----------------------------------------------------------------------------
// Rigged practice setup
// -----------------------------------------------------------------------------

export interface PracticeBotPlan {
  participants: ParticipantState[];
  /** Pre-decided vote for each bot, used at the voting phase. */
  initialVotes: Record<string, VoteSide>;
  /** Bot id => phase where this bot drops their statement (ms offset into the statement phase). */
  statementSchedule: Record<string, number>;
  /** Bot id => phase where this bot casts their vote (ms offset into the voting phase). */
  voteSchedule: Record<string, number>;
  /**
   * Pre-decided side after debate. The "swing" bot flips to the user's side
   * during conversion so the user feels the win — spec section 13 calls for
   * the tutorial to succeed.
   */
  conversionFlips: { participantId: string; newSide: VoteSide; atMsIntoConversion: number }[];
  /** Side the user should be cast onto (always minority). */
  userSide: VoteSide;
}

/**
 * Build the rigged practice round. The user is put on whichever side ends up
 * being 1 vs 5 at reveal, and a swing bot flips to them during the conversion
 * phase so the round ends 3-3 (hung jury → user wins on the conversion).
 *
 * Returns participants in alias order: user first, then bots.
 */
export function buildPracticeRound(args: {
  scenario: Scenario;
  user: {
    id: string;
    userId: string;
    alias: string;
    avatarId: AvatarId;
    tier: ParticipantState['tier'];
  };
  rng: () => number;
}): PracticeBotPlan {
  const { scenario, user, rng } = args;

  // Pick which side the user lands on by coin flip — keeps practice rounds
  // varied so a returning user doesn't always see the same script.
  const userSide: VoteSide = rng() < 0.5 ? 'a' : 'b';
  const majoritySide: VoteSide = userSide === 'a' ? 'b' : 'a';

  // 5 bots all start on the majority side; later a swing bot flips.
  const initialVotes: Record<string, VoteSide> = {};
  PRACTICE_BOTS.forEach((bot) => {
    initialVotes[bot.id] = majoritySide;
  });

  // The swing bot is the most "principled" — it's the most believable flip.
  const swingBot = PRACTICE_BOTS.find((b) => b.voice === 'principled') ?? PRACTICE_BOTS[0]!;

  // Statement timing: stagger across the 60s statement phase so the feed
  // feels alive instead of dropping all five lines at once.
  const statementSchedule: Record<string, number> = {};
  PRACTICE_BOTS.forEach((bot, i) => {
    statementSchedule[bot.id] = 6_000 + i * 8_000; // 6s, 14s, 22s, 30s, 38s
  });

  // Vote timing: most bots vote in the first 10s of the 20s vote phase. One
  // late voter ramps the timer tension.
  const voteSchedule: Record<string, number> = {};
  PRACTICE_BOTS.forEach((bot, i) => {
    voteSchedule[bot.id] = 1_500 + i * 2_500 + (i === PRACTICE_BOTS.length - 1 ? 6_000 : 0);
  });

  // Conversion flip: the swing bot crosses to the user's side at 12s into
  // the 30s conversion phase. That's enough lead-in for the user to read
  // their own minority statement before the room shifts.
  const conversionFlips: PracticeBotPlan['conversionFlips'] = [
    { participantId: swingBot.id, newSide: userSide, atMsIntoConversion: 12_000 },
  ];

  // If we wanted a 3-3 hung jury that the user wins on conversion mechanics,
  // we need a second flip too — flip a second bot 4s later. End state: 4 bots
  // on user side, 1 bot on majority side, plus the user → 5-1 minority win.
  const secondaryFlip = PRACTICE_BOTS.find((b) => b.id !== swingBot.id && b.voice === 'compassionate');
  if (secondaryFlip) {
    conversionFlips.push({
      participantId: secondaryFlip.id,
      newSide: userSide,
      atMsIntoConversion: 18_000,
    });
  }

  // Build participants. User is always first in the list.
  const participants: ParticipantState[] = [
    {
      id: user.id,
      userId: user.userId,
      isBot: false,
      botPersona: null,
      alias: user.alias,
      avatarId: user.avatarId,
      tier: user.tier,
      statement: null,
      vote: null,
      initialVote: null,
      changedVoteDuringConversion: false,
      wasMinority: null,
      conversionsMade: 0,
      statementUpvotes: 0,
      scoreDelta: 0,
      isConnected: true,
    },
    ...PRACTICE_BOTS.map((bot): ParticipantState => ({
      id: bot.id,
      userId: null,
      isBot: true,
      botPersona: bot.voice,
      alias: bot.alias,
      avatarId: bot.avatarId,
      tier: 'citizen',
      statement: null,
      vote: null,
      initialVote: null,
      changedVoteDuringConversion: false,
      wasMinority: null,
      conversionsMade: 0,
      statementUpvotes: 0,
      scoreDelta: 0,
      isConnected: true,
    })),
  ];

  return {
    participants,
    initialVotes,
    statementSchedule,
    voteSchedule,
    conversionFlips,
    userSide,
  };
}

export function getBotPersona(persona: string | null): BotPersona | null {
  if (!persona) return null;
  return PRACTICE_BOTS.find((b) => b.voice === persona) ?? null;
}
