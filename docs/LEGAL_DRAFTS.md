# Legal drafts

> **DRAFT — REQUIRES LEGAL REVIEW BEFORE GO-LIVE.**
> Indian counsel, ~₹15-25k one-time, before public launch.

Five documents. Pre-launch, all five are linked from `/legal`. The page itself renders summaries; the long-form drafts below are what counsel works from.

---

## 1. Privacy policy (DPDP Act, 2023)

**Data we collect**
- Account: email, OAuth provider id, alias, avatar id, region, timezone.
- Gameplay: rooms joined, statements written, votes cast, score history, streak, badges, invite code.
- Device & usage: IP (for region inference + abuse), browser/device type, push opt-in state.
- Optional: analytics events (PostHog), crash reports (Sentry). Both opt-out.

**Why we collect it**
- To run the game (real-time rooms, scoring, leaderboard).
- To protect users (moderation, ban enforcement, reports).
- To improve the product (aggregated analytics).
- To send notifications the user opted in to.

**Retention**
- Account & profile: while the account exists; deleted within 30 days of an account deletion request.
- Gameplay records: aggregated indefinitely; individual statements purged 365 days after the round.
- Reports: 24 months from resolution.

**User rights (DPDP Act, ss. 11-13)**
- Access — export full account data as JSON from Settings → Data.
- Correction — update profile fields in Settings.
- Deletion — Settings → Account → Delete. 30-day grace, then irreversible.
- Withdraw consent — toggle analytics / push at any time.

**Processors**
- Supabase (hosting + DB), OneSignal (push), PostHog (analytics), Sentry (errors), AdMob (Capacitor build only), Anthropic (scenario generation), Resend (transactional email). Data-processing addenda on file with each.

**Grievance officer** — see §4.

---

## 2. Terms of service

- Eligibility: 13+. Under-18 with parental consent where required by local law.
- Account: one per person; alias is locked for 30 days after creation.
- Content: statements you post are yours; you grant Verdict a worldwide, royalty-free license to display them in the game and in aggregate features (Top Voices, share cards).
- Prohibited: harassment, hate speech, doxxing, explicit content, attempts to identify other users outside the game, automation / scripting, advertising.
- Real-money wagering of any kind is strictly prohibited.
- Enforcement: warnings (3 → 24-hour ban; 5 → permanent ban). Appeals via grievance officer.
- Disputes: governed by Indian law, courts of Mumbai. Limitation of liability capped at the greater of ₹1,000 or the amount paid to Verdict in the 12 months preceding the claim.

---

## 3. Community guidelines

- Argue the position, not the person.
- Statements may be sharp; they may not be cruel.
- No identifying information about any real person — yourself or others.
- No content sexualizing or threatening minors.
- No content celebrating violence against people or communities.
- Report rather than retaliate.

---

## 4. Grievance officer (IT Rules, 2021)

To be appointed before launch. Name, email, and 24-hour SLA published on `/legal#grievance` and inside the app under Settings → Help.

---

## 5. Cookies & storage policy

- Essential: session cookie (Supabase auth), CSRF cookie. Cannot be disabled.
- Functional: localStorage for onboarding progress + UI preferences.
- Analytics: PostHog cookie (opt-in via the cookie banner).
- Crash: Sentry session id (opt-in).

The cookie banner has a clear reject-all option. Choices are remembered across sessions.

---

## Implementation checklist (links into the code)

- [ ] Account deletion endpoint with 30-day cascade — `app/api/account/delete`
- [ ] Data export endpoint returning full user JSON — `app/api/account/export`
- [ ] Cookie consent banner with reject-all — `components/shared/cookie-banner.tsx`
- [ ] Age gate at signup — currently relies on the user-attested 13+ in the ToS link; add an explicit checkbox before launch
- [ ] Report-to-resolution UI with SLA timer — Phase 5
- [ ] Grievance officer name + email in `/legal` and Settings → Help
