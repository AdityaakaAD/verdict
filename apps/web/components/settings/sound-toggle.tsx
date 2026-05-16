'use client';

import { useEffect, useState } from 'react';
import { sounds } from '@/lib/sounds';
import { ToggleRow } from './toggle-row';

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEnabled(sounds.isEnabled());
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <ToggleRow
      label="Sound effects"
      description="Vote taps, the gong on a conversion, win and loss stings."
      initial={enabled}
      onChange={(value) => {
        sounds.setEnabled(value);
        if (value) sounds.play('vote_tap');
      }}
    />
  );
}
