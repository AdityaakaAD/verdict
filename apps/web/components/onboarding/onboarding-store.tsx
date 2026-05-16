'use client';

// Onboarding state. Persisted to localStorage so an abandoned flow can be
// resumed from the same step. After /tutorial completes the server action
// creates the profile row and clears the store.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AvatarId, Interest } from '@verdict/shared';

const STORAGE_KEY = 'verdict.onboarding.v1';

export type OnboardingStep = 'welcome' | 'interests' | 'region' | 'alias' | 'avatar' | 'tutorial';

export const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'interests',
  'region',
  'alias',
  'avatar',
  'tutorial',
];

export interface OnboardingState {
  interests: Interest[];
  region: string | null;
  timezone: string | null;
  alias: string | null;
  avatarId: AvatarId | null;
}

const EMPTY: OnboardingState = {
  interests: [],
  region: null,
  timezone: null,
  alias: null,
  avatarId: null,
};

interface Ctx extends OnboardingState {
  setInterests: (next: Interest[]) => void;
  setRegion: (code: string, timezone: string) => void;
  setAlias: (alias: string) => void;
  setAvatar: (id: AvatarId) => void;
  reset: () => void;
}

const OnboardingContext = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount. SSR renders the empty state; the
  // first client paint replaces it.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      // ignore: corrupted localStorage falls back to empty
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore: storage full, private mode, etc.
    }
  }, [state, hydrated]);

  // Stable setter references — useCallback with empty deps so function identity never
  // changes. Consumers that put these in a useEffect dep array won't re-fire just
  // because an unrelated state field changed.
  const setInterests = useCallback((interests: Interest[]) => setState((s) => ({ ...s, interests })), []);
  const setRegion = useCallback((region: string, timezone: string) => setState((s) => ({ ...s, region, timezone })), []);
  const setAlias = useCallback((alias: string) => setState((s) => ({ ...s, alias })), []);
  const setAvatar = useCallback((avatarId: AvatarId) => setState((s) => ({ ...s, avatarId })), []);
  const reset = useCallback(() => {
    setState(EMPTY);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ ...state, setInterests, setRegion, setAlias, setAvatar, reset }),
    [state, setInterests, setRegion, setAlias, setAvatar, reset],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): Ctx {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  return ctx;
}
