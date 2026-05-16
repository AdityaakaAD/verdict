# VERDICT

A 6-10 player real-time social judgment game. Players read a morally ambiguous scenario, type their reasoning publicly while voting privately, witness a cinematic reveal of majority vs minority, and the minority gets 90 seconds to convert majority members. One round ≈ 5 minutes.

> Judge the world. Be judged by it.

---

## Monorepo layout

```
verdict/
├── apps/
│   ├── web/                  # Next.js 14 App Router (Vercel)
│   └── socket/               # Socket.io server (Railway)
├── packages/
│   ├── shared/               # Shared types, socket events, constants
│   └── scenario-generator/   # AI scenario generation worker
├── supabase/
│   ├── migrations/           # One file per table
│   └── seed/                 # 200 launch scenarios
└── docs/                     # ARCHITECTURE, DESIGN_SYSTEM, LEGAL_DRAFTS
```

## Tech stack

Next.js 14 (App Router, TS strict) · Tailwind + Framer Motion · shadcn/ui (heavily restyled) · Socket.io · Supabase (Postgres + RLS + Auth + Storage + Realtime) · Upstash Redis · Vercel + Railway · OneSignal · PostHog · Sentry · Howler.js · Anthropic API (Claude Sonnet) · Resend · next-intl · Capacitor (Android wrap) · AdMob.

## Getting started

Prerequisites: Node 20 LTS, pnpm 10+.

```bash
pnpm install
cp .env.example .env.local      # fill in Supabase + service keys
pnpm dev                         # starts apps/web on :3000
pnpm dev:socket                  # starts apps/socket on :4000 (separate terminal)
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run Next.js dev server (apps/web) |
| `pnpm dev:socket` | Run Socket.io dev server (apps/socket) |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | Run TypeScript in all packages |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Prettier write |

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [Legal drafts](docs/LEGAL_DRAFTS.md) — DRAFT, requires lawyer review pre-launch

## Status

Pre-launch. Closed beta target: phase 6.
