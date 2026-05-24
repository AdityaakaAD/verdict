'use client';

import { createContext, useContext, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { sounds, type SoundId } from '@/lib/sounds';

interface SoundContextValue {
  play: (id: SoundId) => void;
  stop: (id: SoundId) => void;
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
  preload: () => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const preloaded = useRef(false);

  const play = useCallback((id: SoundId) => {
    sounds.play(id);
  }, []);

  const stop = useCallback((id: SoundId) => {
    sounds.stop(id);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    sounds.setEnabled(enabled);
  }, []);

  const isEnabled = useCallback(() => sounds.isEnabled(), []);

  const preload = useCallback(() => {
    if (preloaded.current) return;
    preloaded.current = true;
    sounds.preloadAll();
  }, []);

  // Start room ambience after first user gesture
  useEffect(() => {
    const handleFirstGesture = () => {
      preload();
      play('room_ambience');
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
    };
    window.addEventListener('touchstart', handleFirstGesture, { once: true });
    window.addEventListener('click', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
    };
  }, [play, preload]);

  return (
    <SoundContext.Provider value={{ play, stop, setEnabled, isEnabled, preload }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within SoundProvider');
  return ctx;
}
