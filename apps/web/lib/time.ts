// Time helpers that respect the user's profile timezone. Drop time is 9 PM
// local per spec section 7. All date math here is tz-aware via date-fns-tz.

import { addDays, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { FEATURED_DROP_HOUR_LOCAL, FEATURED_DROP_MINUTE_LOCAL } from '@verdict/shared';

/**
 * Returns the next 9:00 PM in the given IANA timezone. If 9 PM has already
 * passed today in that tz, returns 9 PM tomorrow.
 */
export function nextDropAt(timezone: string, now: Date = new Date()): Date {
  // Move "now" into the target timezone, set 9 PM, then translate back to UTC.
  const inTz = toZonedTime(now, timezone);
  let dropInTz = setMilliseconds(setSeconds(setMinutes(setHours(inTz, FEATURED_DROP_HOUR_LOCAL), FEATURED_DROP_MINUTE_LOCAL), 0), 0);
  if (dropInTz.getTime() <= inTz.getTime()) {
    dropInTz = addDays(dropInTz, 1);
  }
  return fromZonedTime(dropInTz, timezone);
}

/**
 * Format a duration in ms as H:MM:SS or M:SS depending on length. Used by
 * the home countdown.
 */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}
