# Design system

Source of truth is `apps/web/app/globals.css` (CSS tokens) and `apps/web/tailwind.config.ts` (Tailwind theme). This doc explains the intent. If something here conflicts with the code, the code is right; fix the doc.

## Voice

Editorial, weighty, present-tense. No exclamation marks anywhere. No emoji in product UI. Sentence case for everything except `≤11px` label-caps, which is `UPPERCASE TRACKED 0.08em`.

## Tokens

```
--bg-primary       #0a0a0b      canvas
--bg-secondary     #0f0f11      cards, surfaces
--bg-tertiary      #1a1a1e      hover, active states
--border-subtle    #1f1f23      all borders, always 0.5px
--border-active    #2a2a30      hover / focus border
--text-primary     #f8f7f4      cream-white, headlines + body
--text-secondary   #888782      muted body
--text-tertiary    #5a5a56      disabled, faint
--accent           #ff3b30      crimson — verdicts, conversions, streak active, primary CTAs
--accent-hover     #ff6b5c
--vote-a           #ff3b30      ONLY at reveal animation onward
--vote-b           #2d7ff9      ONLY at reveal animation onward
--vote-neutral     #2a2a30      vote buttons during voting — colorless tension
--success          #30d158      streak milestone unlocks only
--gold             #d4a04c      Oracle tier flair only
```

Crimson is reserved. Use it only for: logo period, active streak number, primary CTAs, conversion event flash, micro-divider dots, the "Tonight's Verdict" label dot. If you reach for it in a fourth place, you have probably mis-designed the screen.

## Type

- **Lora** (serif, 400/500) — scenario text, result headlines, tier names, share-card scenario.
- **Inter** (sans, 400/500) — all UI labels, buttons, body, statement feed.
- **JetBrains Mono** (mono, 400/500) — timers, scores, vote counts, dates, char counters.
- Sizes: 11, 13, 15, 18, 22, 28, 36px. Nothing else.
- Weights: 400 and 500. Never 600+.

## Components

- Buttons: 10px radius, 14-16px padding, 0.5px border, no shadow.
- Cards: 12-14px radius, `--bg-secondary` fill, `--border-subtle` 0.5px.
- Inputs: transparent fill, 0.5px subtle border, focus = accent border (not glow).
- Vote buttons during voting: **neutral gray**. Color floods in at the reveal moment. The reveal IS the drama.

## Hard refusals

- No box shadows.
- No gradients.
- No glassmorphism / backdrop blur.
- No emoji in UI.
- No exclamation marks in copy.
- No ALL-CAPS for headlines / body — only `≤11px` labels.
- No pre-coloring vote buttons before reveal.
- No real-name social features.

## Motion

Framer Motion. Common transitions:

- Vote tap: `scale(0.96)` + 100ms ease-out + Capacitor haptic.
- Reveal: stagger 200ms per vote flip.
- Conversion event: full-screen 80ms white flash + gong sound.
- Page transitions: opacity + 6px translate-y, 200ms.

## Sound

Six events. Pixabay CC0 in v1; commission original assets after revenue. Wired through Howler.js. All sounds togglable in settings, default on.

| Event | Approx duration |
|---|---|
| Vote tap | 50-80ms |
| Statement send | 200ms |
| Tick (final 5s of voting) | 1Hz loop |
| Vote flip | 150-250ms |
| Conversion gong | 800ms |
| Win / loss sting | 800-1200ms |
