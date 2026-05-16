import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Library — Verdict' };
export const dynamic = 'force-dynamic';

interface ScenarioRow {
  id: string;
  text: string;
  question: string;
  context_tag: string | null;
  side_a_label: string;
  side_b_label: string;
  category: string;
  total_plays: number;
  total_a_votes: number;
  total_b_votes: number;
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/library');

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const category = searchParams.category ?? '';

  let query = supabase
    .from('scenarios')
    .select('id, text, question, context_tag, side_a_label, side_b_label, category, total_plays, total_a_votes, total_b_votes')
    .eq('is_active', true)
    .eq('language', 'en')
    .order('total_plays', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (category) query = query.eq('category', category);

  const { data: scenarios } = await query.returns<ScenarioRow[]>();

  const CATEGORIES = [
    ['', 'All'],
    ['justice_law', 'Justice & Law'],
    ['society_politics', 'Society & Politics'],
    ['personal_relationships', 'Relationships'],
    ['work_career', 'Work & Career'],
    ['tech_ai', 'Tech & AI'],
    ['health_medicine', 'Health'],
    ['money_wealth', 'Money'],
    ['environment', 'Environment'],
    ['identity_belief', 'Identity'],
    ['love_romance', 'Love'],
    ['crime', 'Crime'],
    ['the_future', 'The Future'],
  ] as const;

  return (
    <main className="mx-auto max-w-[520px] px-6 pb-24 pt-12">
      <header className="flex items-center justify-between">
        <Link href="/home" className="text-11 text-text-secondary label-caps hover:text-text-primary">
          ← Home
        </Link>
        <span className="text-11 text-text-tertiary label-caps">Library</span>
      </header>

      <h1 className="mt-10 font-serif text-28 font-medium">Scenario library.</h1>
      <p className="mt-2 text-15 text-text-secondary">
        {scenarios?.length ?? 0} scenarios · sorted by most played
      </p>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map(([val, label]) => {
          const active = category === val;
          const href = val ? `/library?category=${val}` : '/library';
          return (
            <Link
              key={val}
              href={href}
              className={
                'rounded-full border-hairline px-3 py-1 text-11 label-caps transition-colors ' +
                (active
                  ? 'border-hairline-accent text-accent'
                  : 'text-text-secondary hover:border-hairline-active hover:text-text-primary')
              }
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Scenario list */}
      <ul className="mt-8 space-y-3">
        {(scenarios ?? []).map((s) => {
          const total = s.total_a_votes + s.total_b_votes;
          const aPct = total > 0 ? Math.round((s.total_a_votes / total) * 100) : 50;
          const bPct = 100 - aPct;
          return (
            <li key={s.id} className="rounded-md border-hairline bg-bg-secondary p-5">
              {s.context_tag ? (
                <p className="mb-2 text-11 text-text-secondary label-caps">{s.context_tag}</p>
              ) : null}
              <p className="text-15 leading-relaxed text-text-primary">{s.text}</p>
              <p className="mt-2 text-13 text-text-secondary">{s.question}</p>
              {/* Vote split bar */}
              {total > 0 ? (
                <div className="mt-4">
                  <div className="flex h-1 overflow-hidden rounded-full">
                    <div className="bg-[var(--vote-a)]" style={{ width: `${aPct}%` }} />
                    <div className="bg-[var(--vote-b)]" style={{ width: `${bPct}%` }} />
                  </div>
                  <div className="mt-1.5 flex justify-between font-mono text-11 text-text-tertiary">
                    <span>{s.side_a_label} {aPct}%</span>
                    <span>{bPct}% {s.side_b_label}</span>
                  </div>
                </div>
              ) : null}
              <p className="mt-3 font-mono text-11 text-text-tertiary">
                {s.total_plays} {s.total_plays === 1 ? 'play' : 'plays'}
              </p>
            </li>
          );
        })}
        {(!scenarios || scenarios.length === 0) ? (
          <li className="py-12 text-center text-15 text-text-secondary">
            No scenarios in this category yet.
          </li>
        ) : null}
      </ul>

      {/* Pagination */}
      <div className="mt-8 flex gap-3">
        {page > 1 ? (
          <Link
            href={`/library?${category ? `category=${category}&` : ''}page=${page - 1}`}
            className="flex h-11 flex-1 items-center justify-center rounded-md border-hairline text-13 text-text-secondary hover:border-hairline-active"
          >
            ← Previous
          </Link>
        ) : null}
        {(scenarios?.length ?? 0) === pageSize ? (
          <Link
            href={`/library?${category ? `category=${category}&` : ''}page=${page + 1}`}
            className="flex h-11 flex-1 items-center justify-center rounded-md border-hairline text-13 text-text-secondary hover:border-hairline-active"
          >
            Next →
          </Link>
        ) : null}
      </div>
    </main>
  );
}
