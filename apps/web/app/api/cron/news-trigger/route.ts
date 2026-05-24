// GET /api/cron/news-trigger
//
// Vercel Cron endpoint — fires every 2 hours (see vercel.json).
// Delegates to packages/scenario-generator/src/news-trigger.ts.
//
// Protected by CRON_SECRET header (set in Vercel env + vercel.json).

import { NextResponse, type NextRequest } from 'next/server';
import { runNewsTrigger } from '@verdict/scenario-generator';

export const runtime = 'nodejs';
export const maxDuration = 120; // seconds — scenario gen can take ~60s for 3 stories

export async function GET(request: NextRequest) {
  // Verify Vercel Cron secret (also works for manual curl with Authorization header)
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env['CRON_SECRET'];
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  const anthropicKey = process.env['ANTHROPIC_API_KEY'];
  const newsApiKey = process.env['NEWSAPI_KEY'];
  const resendKey = process.env['RESEND_API_KEY'];
  const founderEmail = process.env['FOUNDER_EMAIL'];
  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://verdict.app';

  const missing = [
    !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
    !supabaseKey && 'SUPABASE_SERVICE_ROLE_KEY',
    !anthropicKey && 'ANTHROPIC_API_KEY',
    !newsApiKey && 'NEWSAPI_KEY',
    !resendKey && 'RESEND_API_KEY',
    !founderEmail && 'FOUNDER_EMAIL',
  ].filter(Boolean);

  if (missing.length > 0) {
    console.error('[news-trigger] missing env vars:', missing);
    return NextResponse.json({ error: 'Missing env vars', missing }, { status: 500 });
  }

  console.log('[news-trigger] starting run at', new Date().toISOString());

  const result = await runNewsTrigger({
    supabaseUrl: supabaseUrl!,
    supabaseServiceKey: supabaseKey!,
    anthropicKey: anthropicKey!,
    newsApiKey: newsApiKey!,
    resendKey: resendKey!,
    founderEmail: founderEmail!,
    appUrl,
  });

  console.log('[news-trigger] result:', result);
  return NextResponse.json(result);
}
