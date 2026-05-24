'use client';

// Sound system. Six events from spec section 14, played via Howler.
//
// Behaviour:
//   - Lazy-init on first play() call to keep the marketing page lightweight.
//   - Every call wrapped in try/catch: a missing file or a browser autoplay
//     block must never crash the game UI.
//   - Globally muteable via setEnabled(false) — persisted to localStorage so
//     a player's preference survives a refresh.
//   - Files live in /public/sounds. Pixabay CC0 sources in v1; switch to
//     commissioned originals post-revenue (spec section 14 caveat).

import { Howl } from 'howler';

export type SoundId =
  | 'vote_tap'
  | 'statement_send'
  | 'tick'
  | 'vote_flip'
  | 'conversion_gong'
  | 'win_sting'
  | 'loss_sting'
  | 'juror_join'
  | 'heartbeat'
  | 'room_ambience'
  | 'flip'
  | 'gong'
  | 'win'
  | 'loss';

interface SoundConfig {
  src: string;
  volume: number;
  loop?: boolean;
}

// Files to be dropped into apps/web/public/sounds/ before Phase 2 closes.
// If a file is missing, the try/catch in play() keeps the game silent
// rather than breaking.
const CONFIG: Record<SoundId, SoundConfig> = {
  vote_tap: { src: '/sounds/vote-tap.mp3', volume: 0.6 },
  statement_send: { src: '/sounds/statement-send.mp3', volume: 0.4 },
  tick: { src: '/sounds/tick.mp3', volume: 0.3, loop: false },
  vote_flip: { src: '/sounds/vote-flip.mp3', volume: 0.55 },
  conversion_gong: { src: '/sounds/conversion-gong.mp3', volume: 0.96 }, // 1.2x loud
  win_sting: { src: '/sounds/win-sting.mp3', volume: 0.6 },
  loss_sting: { src: '/sounds/loss-sting.mp3', volume: 0.4 },
  // Spec section 4 additions
  juror_join: { src: '/sounds/juror-join.mp3', volume: 0.4 },
  heartbeat: { src: '/sounds/heartbeat.mp3', volume: 0.3, loop: true },
  room_ambience: { src: '/sounds/ambience.mp3', volume: 0.08, loop: true },
  flip: { src: '/sounds/vote-flip.mp3', volume: 0.5 },     // alias
  gong: { src: '/sounds/conversion-gong.mp3', volume: 0.8 }, // alias
  win: { src: '/sounds/win-sting.mp3', volume: 0.6 },       // alias
  loss: { src: '/sounds/loss-sting.mp3', volume: 0.4 },     // alias
};

const STORAGE_KEY = 'verdict.sound.enabled';

let enabled = true;
let initialized = false;
const cache: Partial<Record<SoundId, Howl>> = {};

function init() {
  if (initialized) return;
  initialized = true;
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) enabled = stored === 'true';
  } catch {
    // ignore — localStorage unavailable in private mode
  }
}

function load(id: SoundId): Howl | null {
  if (cache[id]) return cache[id]!;
  try {
    const config = CONFIG[id];
    const howl = new Howl({
      src: [config.src],
      volume: config.volume,
      loop: config.loop ?? false,
      html5: false,
      preload: true,
    });
    cache[id] = howl;
    return howl;
  } catch {
    return null;
  }
}

export const sounds = {
  setEnabled(value: boolean) {
    init();
    enabled = value;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(value));
      }
    } catch {
      // ignore
    }
    if (!value) {
      // Stop any looping sounds (the tick) immediately on mute.
      Object.values(cache).forEach((h) => {
        try {
          h?.stop();
        } catch {
          // ignore
        }
      });
    }
  },

  isEnabled(): boolean {
    init();
    return enabled;
  },

  play(id: SoundId): number | null {
    init();
    if (!enabled) return null;
    try {
      const howl = load(id);
      if (!howl) return null;
      return howl.play();
    } catch {
      return null;
    }
  },

  /** Stop a specific sound; useful for the looping tick. */
  stop(id: SoundId) {
    try {
      cache[id]?.stop();
    } catch {
      // ignore
    }
  },

  /** Preload every sound. Call from a user gesture (button click) to satisfy
   *  browser autoplay policies; safe to call multiple times. */
  preloadAll() {
    init();
    (Object.keys(CONFIG) as SoundId[]).forEach((id) => load(id));
  },
};
