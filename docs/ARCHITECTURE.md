# Architecture

This is the working architecture. It evolves with the build; treat the dated section at the bottom as canonical for "where we are right now."

## Topology

```
┌────────────────────┐        wss / https        ┌────────────────────┐
│   apps/web         │ ───────────────────────▶  │   apps/socket      │
│   Next.js 14       │                            │   Socket.io        │
│   Vercel           │                            │   Railway          │
└──────────┬─────────┘                            └──────────┬─────────┘
           │                                                 │
           │             ┌───────────────┐                   │
           │             │ Upstash Redis │ ◀─────────────────┤
           │             └───────────────┘                   │
           │                                                 │
           │      ┌──────────────────────┐                   │
           ▼      ▼                      ▼                   ▼
            ┌──────────────────────────────────────────────────┐
            │            Supabase (Postgres + RLS)             │
            │  profiles · scenarios · rooms · participants     │
            │  reports · upvotes · history · featured · views  │
            └──────────────────────────────────────────────────┘
```

### apps/web
- App Router with route groups: `(marketing)`, `(auth)`, `(onboarding)`, `(app)`.
- `middleware.ts` refreshes Supabase auth cookies and gates the `(app)` routes.
- API routes under `app/api/*` host edge / serverless handlers (share card, cron, moderation).
- Browser Supabase client uses the anon key + RLS; server uses cookie-bound SSR client; service role is **only** imported in server-only paths.

### apps/socket
- Authoritative game state lives here. The web app never trusts the client for timers or vote outcomes.
- XState machine per room (Phase 3). Redis is the source of truth for active rooms; Supabase is the durable write target after a round completes.
- Railway long-lived WS process. Horizontal scale via Redis pub/sub later.

### packages/shared
- Types, socket event contracts, constants (phase durations, scoring, tier thresholds, interest taxonomy, avatar IDs).
- Single source of truth for anything that needs to agree across web ↔ socket.

### packages/scenario-generator
- Phase 5. Cron-driven: pull headlines → Claude Sonnet → moderation → insert as `is_active=false` → email founder digest with approve links.

### Supabase
- One migration file per table under `supabase/migrations/`.
- RLS on every user-touching table. Service role is never exposed to the browser.
- Materialized views `daily_leaderboard` and `weekly_leaderboard` refreshed every ~5 min by a cron route.

## Data flow during a round

1. Client connects to socket on entering `/room/[id]`.
2. Socket server validates auth (Supabase JWT), assigns participant slot, broadcasts `room_state`.
3. Game state machine ticks phases; clients render but never advance them.
4. Submissions (statement, vote) flow client → socket → Redis (in-flight) → Supabase (on round completion).
5. On `completed`, socket writes final participant + room rows, then refreshes the daily leaderboard.

## Auth

- Supabase Email magic link + Google OAuth.
- `/auth/callback` exchanges the code for a session, then routes:
  - profile exists → `/home`
  - no profile → `/welcome` (onboarding)
- `/signout` POST clears the session.

## Onboarding state

- React context + localStorage for partial state.
- Final write happens in `completeOnboarding` server action, which creates the profile row and clears localStorage on success.

## i18n

- `next-intl` configured for `en` (shipping) and `hi` (v1.1 stub).
- Scenarios are language-scoped via the `language` column.

---

## Current state — 2026-05-13

Phase 1 complete (all 10 migrations live in production Supabase, 200 scenarios seeded, real generated types wired in).

Phase 2 complete:
- **Game state machine** — pure reducer in `packages/shared/src/game-machine.ts`. Drives both client-side practice and (Phase 3) the authoritative socket server.
- **Practice mode** — `/room/practice` runs the full 8-phase loop vs 5 scripted bots. Rigged so the user lands as the minority and wins via conversion (spec section 13).
- **Game UI** — `<RoomStage>` switches on phase and renders the right child (`PhaseLobby` → `PhaseScenario` → `PhaseStatement` → `PhaseVoting` → `PhaseReveal` → `PhaseDebate` → `PhaseConversion` → `PhaseResult`). All Framer Motion transitions in place; reveal flips per-card with stagger; conversion fires 80ms white flash + gong on every flip.
- **Sound** — Howler.js wrapper with six events. Persisted mute via localStorage. Missing files fail silent.
- **Home / profile / settings** — real data from `profiles`. Home renders the 9 PM local-time countdown (tz-aware via date-fns-tz), score, tier progress, streak. Settings has toggles for the 4 notification flags + leaderboard visibility + sound mute + sign-out.
- **Share card** — `/api/share-card/[roomId]` returns a 1200×630 OG image via `@vercel/og` for any completed room.

Phase 3 begins next: Socket.io server on Railway, Redis-backed room state, server-authoritative state machine, Quick Match matchmaking + bot backfill, full event surface from spec section 9.
