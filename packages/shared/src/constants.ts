// Shared constants — single source of truth for game tuning, copy thresholds,
// and IDs that both web and socket apps need to agree on.

/** Game phase durations, in seconds. Spec section 6. */
export const PHASE_DURATIONS = {
  lobby: 60,
  scenario: 15,
  statement: 60,
  voting: 20,
  reveal: 10,
  debate: 90,
  conversion: 30,
  result: 10,
} as const;

/** Room sizing. */
export const ROOM_LIMITS = {
  minPlayers: 4,
  maxPlayers: 10,
  reconnectGraceMs: 5_000,
  underflowPauseMs: 15_000,
} as const;

/** Statement input. */
export const STATEMENT_MAX_LENGTH = 240;

/** Scoring (section 10). */
export const SCORING = {
  baseWinMinority: 25,
  baseWinMajority: 10,
  baseLoss: -5,
  perConversion: 15,
  topStatementBonus: 5,
  topStatementThreshold: 3,
  convertedPenalty: -5,
  diminishingDailyThreshold: 5,
  diminishingMultiplier: 0.5,
  minorityFarmerCap: 10,
  minorityFarmerWindow: 20,
  minorityFarmerRate: 0.7,
  unanimousBonus: 3,
} as const;

/** Five tier thresholds. Score never decays below current tier floor. */
export const TIERS = [
  { id: 'citizen', name: 'Citizen', min: 0, max: 200 },
  { id: 'juror', name: 'Juror', min: 200, max: 600 },
  { id: 'advocate', name: 'Advocate', min: 600, max: 1200 },
  { id: 'justice', name: 'Justice', min: 1200, max: 2000 },
  { id: 'oracle', name: 'Oracle', min: 2000, max: Infinity },
] as const;

export type TierId = (typeof TIERS)[number]['id'];

/** The 12 interest chips shown in onboarding step 2. User must pick exactly 5. */
export const INTERESTS = [
  'personal_relationships',
  'work_career',
  'society_politics',
  'tech_ai',
  'justice_law',
  'health_medicine',
  'money_wealth',
  'environment',
  'identity_belief',
  'love_romance',
  'crime',
  'the_future',
] as const;

export type Interest = (typeof INTERESTS)[number];

export const INTEREST_LABELS: Record<Interest, string> = {
  personal_relationships: 'Personal & Relationships',
  work_career: 'Work & Career',
  society_politics: 'Society & Politics',
  tech_ai: 'Tech & AI',
  justice_law: 'Justice & Law',
  health_medicine: 'Health & Medicine',
  money_wealth: 'Money & Wealth',
  environment: 'Environment',
  identity_belief: 'Identity & Belief',
  love_romance: 'Love & Romance',
  crime: 'Crime',
  the_future: 'The Future',
};

export const INTERESTS_REQUIRED = 5;

/** Canonical scenario categories — keep in sync with scenarios.category column. */
export const SCENARIO_CATEGORIES = [
  'personal_relationships',
  'work_career',
  'society_politics',
  'tech_ai',
  'justice_law',
  'health_medicine',
  'money_wealth',
  'environment',
  'identity_belief',
  'love_romance',
  'crime',
  'the_future',
] as const;

export type ScenarioCategory = (typeof SCENARIO_CATEGORIES)[number];

/** Featured Scenario drop time, local time per region. Section 7. */
export const FEATURED_DROP_HOUR_LOCAL = 21;
export const FEATURED_DROP_MINUTE_LOCAL = 0;

/** Push notification fire times, local time. Section 15. */
export const PUSH_TIMES_LOCAL = {
  pre_drop: { hour: 20, minute: 45 },
  morning_recap: { hour: 9, minute: 0 },
} as const;

/** Alias rules. Section 13 step 4. */
export const ALIAS_RULES = {
  minLength: 3,
  maxLength: 15,
  pattern: /^[a-z0-9_]+$/,
  lockedForDays: 30,
} as const;

/** 24 abstract avatar IDs — geometric shapes/symbols (NOT human faces). */
export const AVATAR_IDS = [
  'circle', 'triangle', 'square', 'pentagon', 'hexagon', 'octagon',
  'diamond', 'star', 'crescent', 'arrow', 'spiral', 'cross',
  'wave', 'flame', 'leaf', 'mountain', 'eye', 'key',
  'feather', 'thread', 'compass', 'gavel', 'scales', 'lantern',
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];
