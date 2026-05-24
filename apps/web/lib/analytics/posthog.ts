/**
 * PostHog analytics — typed event catalogue for Verdict.
 *
 * All event firing goes through `track()` so we have a single call-site to
 * swap analytics providers. Server Components call `trackServer()` (no-op on
 * missing env); Client Components use `usePostHog()` or call `track()`.
 */

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '';
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

// ---------------------------------------------------------------------------
// Event name catalogue — add new events here before using them anywhere
// ---------------------------------------------------------------------------

export type VerdictEvent =
  // Onboarding
  | 'explainer_started'
  | 'explainer_skipped'
  | 'explainer_completed'
  | 'first_verdict_viewed'
  | 'first_verdict_voted'
  | 'first_verdict_join_live'
  | 'first_verdict_next_scenario'

  // Swipe feed
  | 'swipe_feed_opened'
  | 'swipe_card_voted'       // { scenario_id, vote, method: 'swipe'|'tap' }
  | 'swipe_card_skipped'     // { scenario_id }
  | 'swipe_batch_exhausted'
  | 'swipe_join_live'        // { scenario_id }
  | 'swipe_statement_read'   // { scenario_id, statement_count }

  // Moral fingerprint
  | 'fingerprint_viewed'
  | 'fingerprint_unlocked'   // { total_votes }
  | 'fingerprint_archetype_seen' // { archetype }
  | 'fingerprint_shared'
  | 'fingerprint_twin_viewed'

  // Grand Cases
  | 'grand_case_opened'      // { case_id, chapter_number }
  | 'grand_case_chapter_read' // { case_id, chapter_number }
  | 'grand_case_voted'       // { case_id, chapter_id, vote, changed_from_previous }
  | 'grand_case_comment_posted' // { case_id, chapter_id }
  | 'grand_case_final_card_shared' // { case_id }

  // Comments
  | 'comment_posted'         // { room_id, is_reply }
  | 'comment_upvoted'        // { comment_id }

  // Room / game (existing flow)
  | 'room_vote_cast'         // { room_id, scenario_id, vote }
  | 'room_statement_posted'  // { room_id }
  | 'room_rebuttal_sent'     // { room_id }
  | 'room_result_shared'     // { room_id }

  // Special events
  | 'special_event_viewed'   // { scenario_id }
  | 'special_event_joined'   // { scenario_id }

  // Generic
  | string;

// ---------------------------------------------------------------------------
// Client-side track helper — safe to call in 'use client' components
// ---------------------------------------------------------------------------

/** Fire a PostHog event. No-ops gracefully if PostHog is not loaded. */
export function track(
  event: VerdictEvent,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  try {
    // posthog is attached to window by the PostHogProvider
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ph = (window as any).posthog;
    if (ph?.capture) {
      ph.capture(event, properties);
    }
  } catch {
    // Silently swallow — analytics must never crash the app
  }
}
