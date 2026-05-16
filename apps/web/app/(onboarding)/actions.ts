'use server';

// Server actions backing the onboarding flow:
//   - checkAlias: real-time uniqueness + format validation in step 4
//   - suggestAliases: three alternatives when the requested one is taken
//   - completeOnboarding: writes the profile row, clears localStorage, done

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ALIAS_RULES, AVATAR_IDS, INTERESTS, INTERESTS_REQUIRED } from '@verdict/shared';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

// ---------------------------------------------------------------------------
// Alias check
// ---------------------------------------------------------------------------

export type AliasCheck =
  | { ok: true }
  | { ok: false; reason: 'format' | 'taken' | 'banned'; suggestions?: string[] };

const BANNED_FRAGMENTS = [
  // Lightweight slur filter — full list lives server-side in moderation lib
  // (Phase 5). These are placeholders that block the obvious ones.
  'admin', 'mod_', 'verdict', 'fuck', 'shit', 'rape', 'nigg', 'fag', 'cunt',
];

function checkFormat(alias: string): boolean {
  return ALIAS_RULES.pattern.test(alias)
    && alias.length >= ALIAS_RULES.minLength
    && alias.length <= ALIAS_RULES.maxLength;
}

function containsBanned(alias: string): boolean {
  const lower = alias.toLowerCase();
  return BANNED_FRAGMENTS.some((b) => lower.includes(b));
}

export async function checkAlias(input: string): Promise<AliasCheck> {
  const alias = input.trim().toLowerCase();
  if (!checkFormat(alias)) return { ok: false, reason: 'format' };
  if (containsBanned(alias)) return { ok: false, reason: 'banned' };

  const service = createServiceClient();
  const { data, error } = await service
    .from('profiles')
    .select('id')
    .eq('alias', alias)
    .maybeSingle();
  if (error) {
    // On a transient failure prefer to let the form proceed than to lock
    // the user out; final uniqueness is enforced by the DB constraint at
    // completeOnboarding time.
    return { ok: true };
  }
  if (!data) return { ok: true };

  return { ok: false, reason: 'taken', suggestions: await suggestAliases(alias) };
}

export async function suggestAliases(base: string): Promise<string[]> {
  const root = base
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, ALIAS_RULES.maxLength - 3);
  const suffixes = ['_01', '_jr', '_'];
  const candidates = suffixes
    .map((s) => `${root}${s}${Math.floor(Math.random() * 90 + 10)}`.slice(0, ALIAS_RULES.maxLength))
    .filter((s) => checkFormat(s));

  const service = createServiceClient();
  const { data } = await service.from('profiles').select('alias').in('alias', candidates);
  const taken = new Set((data ?? []).map((r) => r.alias));
  return candidates.filter((c) => !taken.has(c)).slice(0, 3);
}

// ---------------------------------------------------------------------------
// Complete onboarding
// ---------------------------------------------------------------------------

const completeSchema = z.object({
  alias: z.string().regex(ALIAS_RULES.pattern).min(ALIAS_RULES.minLength).max(ALIAS_RULES.maxLength),
  avatarId: z.enum(AVATAR_IDS),
  region: z.string().min(2).max(10),
  timezone: z.string().min(3).max(50),
  interests: z
    .array(z.enum(INTERESTS))
    .length(INTERESTS_REQUIRED, `pick exactly ${INTERESTS_REQUIRED}`),
});

export type CompleteResult = { ok: true } | { ok: false; error: string };

export async function completeOnboarding(input: unknown): Promise<CompleteResult> {
  const parsed = completeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'invalid input' };
  }

  // Capture into stable consts so the closure below keeps narrowing.
  const data = parsed.data;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not authenticated' };
  const userId = user.id;

  // Final format + ban check
  if (containsBanned(data.alias)) {
    return { ok: false, error: 'alias not allowed' };
  }

  const service = createServiceClient();

  // Generate a unique invite code. The DB has a unique constraint; on the
  // (vanishingly rare) collision we retry once.
  async function tryInsert(code: string) {
    return service.from('profiles').insert({
      id: userId,
      alias: data.alias,
      avatar_id: data.avatarId,
      region: data.region,
      timezone: data.timezone,
      interests: data.interests,
      invite_code: code,
    });
  }

  const codeA = randomInviteCode();
  let { error } = await tryInsert(codeA);
  if (error && error.code === '23505') {
    // Either alias or invite_code collided. Try once more with a new code;
    // if alias was the dupe, surface a clear error.
    const codeB = randomInviteCode();
    const retry = await tryInsert(codeB);
    error = retry.error ?? null;
  }

  if (error) {
    if (error.message.toLowerCase().includes('alias')) {
      return { ok: false, error: 'alias just got taken — pick another' };
    }
    return { ok: false, error: error.message };
  }

  redirect('/home');
}

function randomInviteCode(): string {
  const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // no l, o, 0, 1
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}
