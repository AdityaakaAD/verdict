import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Top voices — Verdict' };
export const dynamic = 'force-dynamic';

interface StatementRow {
  id: string;
  statement: string | null;
  statement_upvotes: number;
  vote: string | null;
  profiles: { alias: string } | null;
  rooms: {
    completed_at: string | null;
    scenarios: { text: string; question: string; side_a_label: string; side_b_label: string } | null;
  } | null;
}

export default async function FeedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/feed');

  // Top upvoted statements from rooms completed in the last 48h
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: rawRows } = await supabase
    .from('room_participants')
    .select(`
      id,
      statement,
      statement_upvotes,
      vote,
      profiles(alias),
      rooms!inner(completed_at, scenarios(text, question, side_a_label, side_b_label))
    `)
    .not('statement', 'is', null)
    .gt('statement_upvotes', 0)
    .gte('rooms.completed_at', since)
    .order('statement_upvotes', { ascending: false })
    .limit(30);

  const rows = rawRows as StatementRow[] | null;

  const statements = (rows ?? []).filter(
    (r) => r.statement && r.profiles && r.rooms?.scenarios,
  );

  return (
    <main className="mx-auto max-w-[520px] px-6 pb-24 pt-12">
      <header className="flex items-center justify-between">
        <Link href="/home" className="text-11 text-text-secondary label-caps hover:text-text-primary">
          ← Home
        </Link>
        <span className="text-11 text-text-tertiary label-caps">Top voices</span>
      </header>

      <h1 className="mt-10 font-serif text-28 font-medium">Top voices.</h1>
      <p className="mt-2 text-15 text-text-secondary">
        The most upvoted statements from the last 48 hours.
      </p>

      {statements.length === 0 ? (
        <div className="mt-10 rounded-md border-hairline bg-bg-secondary p-5">
          <p className="text-15 text-text-secondary">
            No statements yet. Tonight's voices appear here the morning after.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {statements.map((row) => {
            const scenario = row.rooms!.scenarios!;
            const sideLabel = row.vote === 'a' ? scenario.side_a_label : scenario.side_b_label;
            const sideColor = row.vote === 'a' ? 'var(--vote-a)' : 'var(--vote-b)';
            return (
              <li
                key={row.id}
                className="rounded-md border-l-[2px] border-hairline bg-bg-secondary p-5"
                style={{ borderLeftColor: sideColor }}
              >
                <p className="text-11 text-text-secondary label-caps">
                  {scenario.question}
                </p>
                <p className="mt-3 font-serif text-15 leading-relaxed text-text-primary">
                  "{row.statement}"
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-11 text-text-tertiary">
                      @{row.profiles!.alias}
                    </span>
                    <span
                      className="text-11 label-caps"
                      style={{ color: sideColor }}
                    >
                      {sideLabel}
                    </span>
                  </div>
                  <span className="font-mono text-13 text-text-secondary tabular-nums">
                    ↑ {row.statement_upvotes}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
