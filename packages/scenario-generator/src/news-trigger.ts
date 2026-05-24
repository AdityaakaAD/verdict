/**
 * news-trigger.ts — topical scenario generator
 *
 * Fetches top headlines from NewsAPI (with RSS fallback), scores each for
 * moral ambiguity, generates a VERDICT scenario for each viable story via
 * the Anthropic API, inserts them into Supabase, and emails the founder a
 * digest with one-click approve/skip links.
 *
 * Runs every 2 hours via Vercel Cron → apps/web/app/api/cron/news-trigger/route.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import RSSParser from 'rss-parser';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const NEWSAPI_ENDPOINT = 'https://newsapi.org/v2/top-headlines';
const NEWSAPI_SOURCES = 'bbc-news,reuters,the-hindu,bloomberg,al-jazeera-english';
const RSS_FALLBACK_FEEDS = [
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://rss.reuters.com/reuters/worldNews',
];

const MAX_STORIES = 8;          // stories to evaluate per run
const MAX_SCENARIOS = 3;        // max to insert (avoid spam)
const MIN_AMBIGUITY_SCORE = 6;  // out of 10

// Categories Anthropic can assign
const VALID_CATEGORIES = [
  'personal_relationships', 'work_career', 'society_politics', 'tech_ai',
  'justice_law', 'health_medicine', 'money_wealth', 'environment',
  'identity_belief', 'love_romance', 'crime', 'the_future',
] as const;
type Category = typeof VALID_CATEGORIES[number];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

interface GeneratedScenario {
  text: string;
  question: string;
  context_tag: string;
  side_a_label: string;
  side_b_label: string;
  side_a_meaning: string;
  side_b_meaning: string;
  category: Category;
  region_locked: string[];
}

interface AmbiguityScore {
  score: number;   // 0–10
  reason: string;
}

interface DigestEntry {
  headline: string;
  scenarioText: string;
  scenarioQuestion: string;
  category: Category;
  approveUrl: string;
  scenarioId: string;
}

// ---------------------------------------------------------------------------
// Prompt loader
// ---------------------------------------------------------------------------

function loadGeneratePrompt(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dir = dirname(__filename);
  try {
    return readFileSync(join(__dir, 'prompts/generate.md'), 'utf-8');
  } catch {
    // Fallback inline
    return `You are a writer for VERDICT. Turn the news headline into a morally ambiguous scenario.
Output only JSON with keys: text, question, context_tag, side_a_label, side_b_label, side_a_meaning, side_b_meaning, category, region_locked.
Rules: anonymize real names; 80-200 words; both sides must be genuinely arguable; no exclamation marks.`;
  }
}

// ---------------------------------------------------------------------------
// Fetch headlines
// ---------------------------------------------------------------------------

async function fetchNewsAPI(apiKey: string): Promise<NewsItem[]> {
  const url = new URL(NEWSAPI_ENDPOINT);
  url.searchParams.set('sources', NEWSAPI_SOURCES);
  url.searchParams.set('pageSize', String(MAX_STORIES * 2));
  url.searchParams.set('apiKey', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await res.json() as { articles?: any[] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (json.articles ?? []).slice(0, MAX_STORIES).map((a: any) => ({
    title: a.title ?? '',
    description: a.description ?? '',
    url: a.url ?? '',
    publishedAt: a.publishedAt ?? new Date().toISOString(),
    source: a.source?.name ?? 'newsapi',
  }));
}

async function fetchRSS(): Promise<NewsItem[]> {
  const parser = new RSSParser();
  const items: NewsItem[] = [];
  for (const feedUrl of RSS_FALLBACK_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of (feed.items ?? []).slice(0, 5)) {
        items.push({
          title: item.title ?? '',
          description: item.contentSnippet ?? item.content ?? '',
          url: item.link ?? '',
          publishedAt: item.isoDate ?? new Date().toISOString(),
          source: feed.title ?? feedUrl,
        });
      }
    } catch {
      // Skip failing feed
    }
    if (items.length >= MAX_STORIES) break;
  }
  return items.slice(0, MAX_STORIES);
}

// ---------------------------------------------------------------------------
// Ambiguity scoring — fast one-token call
// ---------------------------------------------------------------------------

async function scoreMoralAmbiguity(
  anthropic: Anthropic,
  item: NewsItem,
): Promise<AmbiguityScore> {
  const prompt = `Rate this news headline for moral ambiguity on a scale of 0–10.
A score of 10 means: reasonable people could land on either side with equally compelling arguments.
A score of 0 means: clearly good vs clearly bad, no real moral tension.

Headline: "${item.title}"
Summary: "${item.description.slice(0, 300)}"

Respond ONLY with JSON: {"score": <0-10>, "reason": "<10 words max>"}`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 80,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = msg.content[0]?.type === 'text' ? msg.content[0].text : '{}';
    const parsed = JSON.parse(raw.trim()) as { score?: number; reason?: string };
    return {
      score: typeof parsed.score === 'number' ? Math.min(10, Math.max(0, parsed.score)) : 0,
      reason: parsed.reason ?? '',
    };
  } catch {
    return { score: 0, reason: 'scoring failed' };
  }
}

// ---------------------------------------------------------------------------
// Scenario generation
// ---------------------------------------------------------------------------

async function generateScenario(
  anthropic: Anthropic,
  item: NewsItem,
  systemPrompt: string,
): Promise<GeneratedScenario | null> {
  const userMessage = `Headline: "${item.title}"\nSummary: "${item.description.slice(0, 500)}"`;
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const raw = msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : '';
    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = JSON.parse(jsonStr) as any;

    // Skip if model chose to skip
    if (parsed.skip) return null;

    // Validate category
    const cat = VALID_CATEGORIES.includes(parsed.category as Category)
      ? (parsed.category as Category)
      : 'society_politics';

    return {
      text: String(parsed.text ?? '').slice(0, 2000),
      question: String(parsed.question ?? '').slice(0, 300),
      context_tag: String(parsed.context_tag ?? '').slice(0, 80),
      side_a_label: String(parsed.side_a_label ?? 'Yes').slice(0, 60),
      side_b_label: String(parsed.side_b_label ?? 'No').slice(0, 60),
      side_a_meaning: String(parsed.side_a_meaning ?? '').slice(0, 200),
      side_b_meaning: String(parsed.side_b_meaning ?? '').slice(0, 200),
      category: cat,
      region_locked: Array.isArray(parsed.region_locked) ? parsed.region_locked as string[] : [],
    };
  } catch (err) {
    console.error('[news-trigger] scenario gen failed:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Supabase insert
// ---------------------------------------------------------------------------

async function insertScenario(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  scenario: GeneratedScenario,
  sourceHeadline: string,
): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from('scenarios')
    .insert({
      text: scenario.text,
      question: scenario.question,
      context_tag: scenario.context_tag,
      side_a_label: scenario.side_a_label,
      side_b_label: scenario.side_b_label,
      side_a_meaning: scenario.side_a_meaning,
      side_b_meaning: scenario.side_b_meaning,
      category: scenario.category,
      freshness_tier: 'topical',
      source: 'ai_generated',
      is_active: false,                    // founder must approve
      region_locked: scenario.region_locked,
      dimension_tags: {},
      metadata: { source_headline: sourceHeadline },
    })
    .select('id')
    .single();

  if (error) {
    console.error('[news-trigger] insert error:', error);
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any)?.id ?? null;
}

// ---------------------------------------------------------------------------
// Founder email digest via Resend
// ---------------------------------------------------------------------------

async function sendFounderDigest(
  resend: Resend,
  founderEmail: string,
  appUrl: string,
  entries: DigestEntry[],
): Promise<void> {
  if (entries.length === 0) return;

  const rows = entries.map((e) => `
    <tr>
      <td style="padding:12px 0; border-bottom: 1px solid #1f1f23; vertical-align:top;">
        <p style="margin:0 0 4px; font-size:11px; color:#888782; text-transform:uppercase; letter-spacing:0.1em; font-family:monospace;">
          ${e.category.replace(/_/g, ' ')} · topical
        </p>
        <p style="margin:0 0 8px; font-size:14px; color:#f8f7f4; font-family:Georgia, serif; line-height:1.5;">
          ${e.scenarioText.slice(0, 300)}${e.scenarioText.length > 300 ? '…' : ''}
        </p>
        <p style="margin:0 0 10px; font-size:13px; color:#c8c7c4; font-style:italic;">
          ${e.scenarioQuestion}
        </p>
        <p style="margin:0 0 6px; font-size:11px; color:#666; font-family:monospace;">
          Source: ${e.headline.slice(0, 100)}
        </p>
        <a href="${e.approveUrl}"
           style="display:inline-block; padding:8px 16px; background:#ff3b30; color:#0a0a0b; font-size:12px; font-weight:600; text-decoration:none; border-radius:6px; font-family:monospace;">
          Approve &amp; Go Live →
        </a>
      </td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0b; color:#f8f7f4; font-family:Georgia, serif; padding:32px 24px; max-width:640px; margin:0 auto;">
  <p style="font-size:22px; font-weight:500; margin:0 0 4px; letter-spacing:-0.01em;">verdict</p>
  <p style="font-size:12px; color:#888782; font-family:monospace; margin:0 0 24px; text-transform:uppercase; letter-spacing:0.1em;">
    Topical scenario digest · ${new Date().toISOString().slice(0, 10)}
  </p>
  <p style="font-size:14px; color:#c8c7c4; margin:0 0 20px; line-height:1.6;">
    ${entries.length} new topical scenario${entries.length === 1 ? '' : 's'} generated from today's headlines.
    Each is live-inactive until you approve.
  </p>
  <table style="width:100%; border-collapse:collapse;">
    ${rows}
  </table>
  <p style="margin-top:24px; font-size:11px; color:#444; font-family:monospace;">
    Scenarios are inserted with is_active=false. Approve to set is_active=true + freshness_tier='topical'.
    Unapproved rows auto-expire after 6 hours via Supabase TTL policy.
  </p>
</body>
</html>`;

  await resend.emails.send({
    from: 'verdict <digest@mail.verdict.app>',
    to: [founderEmail],
    subject: `[verdict] ${entries.length} topical scenario${entries.length === 1 ? '' : 's'} ready to approve`,
    html,
  });
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export interface NewsTriggerConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  anthropicKey: string;
  newsApiKey: string;
  resendKey: string;
  founderEmail: string;
  appUrl: string;
}

export interface NewsTriggerResult {
  storiesFetched: number;
  storiesScored: number;
  scenariosGenerated: number;
  scenariosInserted: number;
  digestSent: boolean;
  errors: string[];
}

export async function runNewsTrigger(config: NewsTriggerConfig): Promise<NewsTriggerResult> {
  const errors: string[] = [];
  const result: NewsTriggerResult = {
    storiesFetched: 0,
    storiesScored: 0,
    scenariosGenerated: 0,
    scenariosInserted: 0,
    digestSent: false,
    errors,
  };

  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
  const anthropic = new Anthropic({ apiKey: config.anthropicKey });
  const resend = new Resend(config.resendKey);
  const systemPrompt = loadGeneratePrompt();

  // 1. Fetch stories
  let stories: NewsItem[] = [];
  try {
    stories = await fetchNewsAPI(config.newsApiKey);
  } catch (err) {
    errors.push(`NewsAPI failed: ${err}. Trying RSS fallback.`);
    try {
      stories = await fetchRSS();
    } catch (rssErr) {
      errors.push(`RSS fallback also failed: ${rssErr}`);
      return result;
    }
  }
  result.storiesFetched = stories.length;
  if (stories.length === 0) return result;

  // 2. Score all stories for moral ambiguity (parallel, fast Haiku calls)
  const scored = await Promise.all(
    stories.map(async (item) => {
      const amb = await scoreMoralAmbiguity(anthropic, item);
      return { item, ...amb };
    }),
  );
  result.storiesScored = scored.length;

  // 3. Filter to viable stories, take top MAX_SCENARIOS
  const viable = scored
    .filter((s) => s.score >= MIN_AMBIGUITY_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SCENARIOS);

  if (viable.length === 0) {
    errors.push('No stories met the minimum ambiguity threshold.');
    return result;
  }

  // 4. Generate + insert scenarios
  const digestEntries: DigestEntry[] = [];
  for (const { item, reason: _reason } of viable) {
    const scenario = await generateScenario(anthropic, item, systemPrompt);
    if (!scenario) {
      errors.push(`Scenario gen skipped for: ${item.title.slice(0, 60)}`);
      continue;
    }
    result.scenariosGenerated += 1;

    const scenarioId = await insertScenario(supabase, scenario, item.title);
    if (!scenarioId) continue;
    result.scenariosInserted += 1;

    // Build approve URL — hits a protected API route that sets is_active=true
    const approveUrl = `${config.appUrl}/api/admin/approve-scenario?id=${scenarioId}&token=${config.supabaseServiceKey.slice(0, 8)}`;
    digestEntries.push({
      headline: item.title,
      scenarioText: scenario.text,
      scenarioQuestion: scenario.question,
      category: scenario.category,
      approveUrl,
      scenarioId,
    });
  }

  // 5. Send founder digest
  if (digestEntries.length > 0) {
    try {
      await sendFounderDigest(resend, config.founderEmail, config.appUrl, digestEntries);
      result.digestSent = true;
    } catch (mailErr) {
      errors.push(`Resend failed: ${mailErr}`);
    }
  }

  return result;
}
