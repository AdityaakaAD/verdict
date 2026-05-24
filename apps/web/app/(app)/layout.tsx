'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { ExplainerAnimation } from '@/components/onboarding/ExplainerAnimation';
import { createClient } from '@/lib/supabase/client';

/**
 * App layout — wraps all authenticated app routes.
 *
 * Responsibilities:
 *  1. Show the ExplainerAnimation on first-ever app open (has_seen_explainer = false)
 *  2. After explainer: redirect to /first-verdict for first impression
 *  3. PostHog user identification (identify call once per session)
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [showExplainer, setShowExplainer] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) { setChecked(true); return; }

      // PostHog identity — fire once per page load
      if (typeof window !== 'undefined') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ph = (window as any).posthog;
          if (ph?.identify) {
            ph.identify(user.id, { email: user.email });
          }
        } catch { /* noop */ }
      }

      const { data: profile } = await db
        .from('profiles')
        .select('has_seen_explainer, is_first_verdict')
        .eq('id', user.id)
        .maybeSingle();

      if (!cancelled) {
        if (profile && !profile.has_seen_explainer) {
          setShowExplainer(true);
        }
        setChecked(true);
      }
    }
    check();
    return () => { cancelled = true; };
  }, []);

  function handleExplainerComplete() {
    setShowExplainer(false);
    // After explainer, send to the first-verdict hook
    router.push('/first-verdict');
  }

  // Don't render children until we've checked the explainer flag
  // to avoid a flash of the home page before the explainer
  if (!checked) return null;

  return (
    <>
      <AnimatePresence>
        {showExplainer && (
          <ExplainerAnimation onComplete={handleExplainerComplete} />
        )}
      </AnimatePresence>
      {!showExplainer && children}
    </>
  );
}
