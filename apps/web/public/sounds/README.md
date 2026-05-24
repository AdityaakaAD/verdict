# Sound assets

Drop the sound files referenced by `lib/sounds/index.ts` into this folder before public launch. v1 uses CC0 sources from Pixabay Sound Effects (legally free, attribution not required — see spec section 14).

| File | Pixabay search | Approx duration |
|---|---|---|
| `vote-tap.mp3` | "ui click", "soft button" | 50–80ms |
| `statement-send.mp3` | "whoosh subtle", "send message" | ~200ms |
| `tick.mp3` | "clock tick", "metronome" (1 Hz loop) | 1Hz loop |
| `vote-flip.mp3` | "card flip", "page turn" | 150–250ms |
| `conversion-gong.mp3` | "gong", "deep bell" | ~800ms |
| `win-sting.mp3` | "success chime" | 800–1200ms |
| `loss-sting.mp3` | "deep low note" | 800–1200ms |
| `juror-join.mp3` | "notification chime", "join sound" | 200–400ms |
| `heartbeat.mp3` | "heartbeat", "pulse" (loop) | 1–2s loop |
| `ambience.mp3` | "courtroom ambience", "crowd murmur" (loop) | 10–30s loop |

The game does not crash if a file is missing — `sounds.play()` swallows load errors. So shipping without them is safe; the round just plays silently.

**Post-revenue (month 4-6):** commission originals from a sound designer for ~₹3-5k via Fiverr/Upwork (spec section 14).
