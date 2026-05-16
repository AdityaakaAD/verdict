'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/cn';

// Single auth form shared by /login and /signup. Renders email magic-link
// + Google OAuth. Phase 1: passwordless flow only — keeps the surface small
// and matches the editorial tone (no password fields to manage).

type Mode = 'signin' | 'signup';

interface Props {
  mode: Mode;
  next?: string;
  error?: string;
}

export function AuthForm({ mode, next, error }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(error ?? null);

  const supabase = createClient();
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? '/home')}`
      : undefined;

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: mode === 'signup',
        },
      });
      if (error) {
        setFormError(error.message);
        return;
      }
      setSent(true);
    });
  }

  async function handleGoogle() {
    setFormError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) setFormError(error.message);
  }

  if (sent) {
    return (
      <div className="mt-12 rounded-md border-hairline bg-bg-secondary p-5">
        <p className="text-15 text-text-primary">Check your inbox.</p>
        <p className="mt-2 text-13 text-text-secondary">
          We sent a sign-in link to{' '}
          <span className="font-mono text-text-primary">{email}</span>. The link expires in
          fifteen minutes.
        </p>
        <button
          onClick={() => {
            setSent(false);
            router.refresh();
          }}
          className="mt-4 text-13 text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-4">
      <form onSubmit={handleEmailSubmit} className="space-y-3">
        <label className="block">
          <span className="block text-11 text-text-secondary label-caps">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@somewhere.in"
            className="mt-2 h-12 w-full rounded-md border-hairline bg-transparent px-3 text-15 text-text-primary placeholder:text-text-tertiary focus:border-hairline-accent"
          />
        </label>
        <button
          type="submit"
          disabled={pending || email.length === 0}
          className={cn(
            'flex h-12 w-full items-center justify-center rounded-md text-15 font-medium transition-colors duration-100',
            pending
              ? 'bg-bg-tertiary text-text-tertiary'
              : 'bg-accent text-bg-primary hover:bg-accent-hover',
          )}
        >
          {pending ? 'Sending…' : mode === 'signup' ? 'Continue with email' : 'Send sign-in link'}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border-subtle" />
        <span className="text-11 text-text-tertiary label-caps">or</span>
        <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <button
        onClick={handleGoogle}
        type="button"
        className="flex h-12 w-full items-center justify-center rounded-md border-hairline text-15 text-text-primary transition-colors duration-100 hover:border-hairline-active"
      >
        Continue with Google
      </button>

      {formError ? (
        <p className="text-13 text-accent">{formError}</p>
      ) : null}
    </div>
  );
}
