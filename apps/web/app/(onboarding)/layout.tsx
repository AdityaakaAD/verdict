import { redirect } from 'next/navigation';
import { OnboardingProvider } from '@/components/onboarding/onboarding-store';
import { ProgressDots } from '@/components/onboarding/progress-dots';
import { createClient } from '@/lib/supabase/server';

// Onboarding shell:
//   - Requires an authenticated user (otherwise → /login)
//   - If a profile already exists, jump straight to /home (skip onboarding)
//   - Renders the progress dots at the top
//   - Wraps children in the OnboardingProvider so each step shares state

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/welcome');

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (existing) redirect('/home');

  return (
    <OnboardingProvider>
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col px-6 pb-12 pt-8">
        <header className="flex items-center justify-between">
          <span className="font-serif text-18 font-medium tracking-tight">verdict</span>
          <ProgressDots />
        </header>
        <div className="flex-1">{children}</div>
      </div>
    </OnboardingProvider>
  );
}
