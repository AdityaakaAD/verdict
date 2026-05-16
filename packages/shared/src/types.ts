// Core domain types shared between web and socket server. These mirror the
// Postgres schema in supabase/migrations and the socket events in events.ts.

import type { AvatarId, Interest, ScenarioCategory, TierId } from './constants';

export type GamePhase =
  | 'lobby'
  | 'scenario'
  | 'statement'
  | 'voting'
  | 'reveal'
  | 'debate'
  | 'conversion'
  | 'result'
  | 'completed';

export type RoomType = 'featured' | 'quick_match' | 'private' | 'practice';

export type VoteSide = 'a' | 'b';

export type MajorityOutcome = 'a' | 'b' | 'hung' | 'unanimous';

export type FreshnessTier = 'evergreen' | 'topical' | 'seasonal';

export type ScenarioSource = 'curated' | 'ai_generated' | 'user_submitted';

export interface Scenario {
  id: string;
  text: string;
  question: string;
  contextTag: string | null;
  sideALabel: string;
  sideBLabel: string;
  sideAMeaning: string;
  sideBMeaning: string;
  category: ScenarioCategory;
  freshnessTier: FreshnessTier;
  source: ScenarioSource;
  regionLocked: string[];
  language: string;
  isActive: boolean;
  voteBalanceScore: number;
  totalPlays: number;
  totalAVotes: number;
  totalBVotes: number;
}

export interface Profile {
  id: string;
  alias: string;
  avatarId: AvatarId;
  region: string;
  timezone: string;
  interests: Interest[];
  showOnLeaderboard: boolean;
  verdictScore: number;
  tier: TierId;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  badgesEarned: string[];
  inviteCode: string;
  invitedByUserId: string | null;
  successfulInvites: number;
  notificationsDrop: boolean;
  notificationsReveal: boolean;
  notificationsSocial: boolean;
  soundEnabled: boolean;
  isBanned: boolean;
}

export interface Participant {
  id: string;
  roomId: string;
  userId: string | null;
  isBot: boolean;
  botPersona: string | null;
  alias: string;
  avatarId: AvatarId;
  tier: TierId;
  statement: string | null;
  vote: VoteSide | null;
  initialVote: VoteSide | null;
  changedVoteDuringConversion: boolean;
  wasMinority: boolean | null;
  conversionsMade: number;
  statementUpvotes: number;
  scoreDelta: number;
  isConnected: boolean;
}

export interface RoomSnapshot {
  id: string;
  scenario: Scenario;
  type: RoomType;
  phase: GamePhase;
  phaseEndsAt: string | null;
  participants: Participant[];
  inviteCode: string | null;
  region: string;
  resultMajoritySide: MajorityOutcome | null;
  resultMinorityWon: boolean | null;
  totalConversions: number;
}

export interface RevealPayload {
  majoritySide: VoteSide | 'hung' | 'unanimous';
  minoritySide: VoteSide | null;
  voteBreakdown: { a: number; b: number };
  participantVotes: Array<{ participantId: string; vote: VoteSide }>;
}

export interface ResultPayload {
  winningSide: VoteSide | 'hung' | 'unanimous';
  minorityWon: boolean;
  totalConversions: number;
  topStatement: {
    participantId: string;
    text: string;
    upvotes: number;
  } | null;
  scoreDeltas: Array<{ participantId: string; delta: number }>;
}

export type ReportReason =
  | 'harassment'
  | 'hate_speech'
  | 'spam'
  | 'self_harm'
  | 'explicit_content'
  | 'other';

export interface SocketError {
  code:
    | 'unauthorized'
    | 'room_full'
    | 'already_joined'
    | 'phase_mismatch'
    | 'statement_too_long'
    | 'banned'
    | 'rate_limited'
    | 'internal';
  message: string;
}
