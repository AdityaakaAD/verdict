import { redirect } from 'next/navigation';
import { loadPracticeScenario } from '@/lib/game/load-practice-scenario';
import { loadPracticeProfile } from '@/lib/game/load-profile';
import { PracticeRoom } from './practice-room';

export const metadata = { title: 'Practice — Verdict' };

// /room/practice — single-player rounds against five scripted bots. Spec
// section 13 step 6 calls this out as the rigged tutorial; we reuse the
// same flow for all post-onboarding practice rounds. No scoring is
// persisted (practice is loss-aversion-free by design).

export const dynamic = 'force-dynamic';

export default async function PracticePage() {
  const profile = await loadPracticeProfile();
  if (!profile) redirect('/login?next=/room/practice');

  const scenario = await loadPracticeScenario(profile.id);
  if (!scenario) {
    return (
      <main className="mx-auto max-w-[480px] px-6 pt-16">
        <h1 className="font-serif text-22 font-medium">No scenarios available yet.</h1>
        <p className="mt-3 text-15 text-text-secondary">
          The library is empty right now. The scenario engine drops new ones daily.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[520px] px-6 pb-24 pt-8">
      <PracticeRoom
        scenario={scenario}
        user={{
          id: `human_${profile.id}`,
          userId: profile.id,
          alias: profile.alias,
          avatarId: profile.avatarId,
          tier: profile.tier,
        }}
      />
    </main>
  );
}
