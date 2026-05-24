// AI scenario generator entry point.
// Vercel Cron triggers apps/web/app/api/cron/news-trigger/route.ts which calls
// runNewsTrigger(), and apps/web/app/api/cron/daily-scenario which may call
// generateDailyScenarios() for the 3 AM curated batch.

export { runNewsTrigger } from './news-trigger.js';
export type { NewsTriggerConfig, NewsTriggerResult } from './news-trigger.js';

// Legacy stub — still here so any existing import surface doesn't break.
export async function generateDailyScenarios(): Promise<{ inserted: number }> {
  return { inserted: 0 };
}
