'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ALIAS_RULES } from '@verdict/shared';
import { useOnboarding } from '@/components/onboarding/onboarding-store';
import { checkAlias, type AliasCheck } from '../actions';
import { cn } from '@/lib/cn';

type State =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'ok' }
  | { status: 'format' | 'banned' }
  | { status: 'taken'; suggestions: string[] };

export default function AliasPage() {
  const router = useRouter();
  const { alias, setAlias } = useOnboarding();
  const [value, setValue] = useState(alias ?? '');
  const [state, setState] = useState<State>({ status: 'idle' });
  const [, startTransition] = useTransition();

  // Debounced async availability check. 300ms feels responsive but doesn't
  // hammer the DB on every keystroke.
  useEffect(() => {
    if (value.length === 0) {
      setState({ status: 'idle' });
      return;
    }
    setState({ status: 'checking' });
    const t = setTimeout(() => {
      startTransition(async () => {
        const result: AliasCheck = await checkAlias(value);
        if (result.ok) {
          setState({ status: 'ok' });
          setAlias(value.toLowerCase());
        } else if (result.reason === 'taken') {
          setState({ status: 'taken', suggestions: result.suggestions ?? [] });
        } else {
          setState({ status: result.reason });
        }
      });
    }, 300);
    return () => clearTimeout(t);
  }, [value, setAlias]);

  const canContinue = state.status === 'ok' && value.length >= ALIAS_RULES.minLength;

  return (
    <section className="flex h-full flex-col pt-12">
      <h1 className="font-serif text-28 font-medium leading-tight">Choose your alias.</h1>
      <p className="mt-3 max-w-[36ch] text-15 text-text-secondary">
        This is who you are inside the courtroom. Choose carefully — you cannot change it for
        thirty days.
      </p>

      <div className="mt-8 space-y-3">
        <label className="block">
          <span className="block text-11 text-text-secondary label-caps">Alias</span>
          <div className="mt-2 flex items-center rounded-md border-hairline focus-within:border-hairline-accent">
            <span className="pl-3 font-mono text-15 text-text-tertiary">@</span>
            <input
              type="text"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={ALIAS_RULES.maxLength}
              value={value}
              onChange={(e) => setValue(e.target.value.toLowerCase())}
              placeholder="yourname"
              className="h-12 w-full bg-transparent px-2 font-mono text-15 text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <span className="pr-3 font-mono text-11 text-text-tertiary">
              {value.length}/{ALIAS_RULES.maxLength}
            </span>
          </div>
        </label>

        <p className="text-11 text-text-tertiary label-caps">
          3-15 chars · lowercase · letters, numbers, underscore
        </p>

        <StateLine state={state} onPick={setValue} />
      </div>

      <div className="mt-auto flex gap-3 pt-12">
        <button
          type="button"
          onClick={() => router.push('/region')}
          className="flex h-12 flex-1 items-center justify-center rounded-md border-hairline text-15 text-text-secondary hover:border-hairline-active hover:text-text-primary"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => router.push('/avatar')}
          className={cn(
            'flex h-12 flex-[2] items-center justify-center rounded-md text-15 font-medium transition-colors duration-100',
            canContinue
              ? 'bg-accent text-bg-primary hover:bg-accent-hover'
              : 'bg-bg-tertiary text-text-tertiary',
          )}
        >
          Continue
        </button>
      </div>
    </section>
  );
}

function StateLine({ state, onPick }: { state: State; onPick: (v: string) => void }) {
  switch (state.status) {
    case 'idle':
      return null;
    case 'checking':
      return <p className="text-13 text-text-tertiary">Checking…</p>;
    case 'ok':
      return <p className="text-13 text-text-primary">Available.</p>;
    case 'format':
      return <p className="text-13 text-accent">Format does not match.</p>;
    case 'banned':
      return <p className="text-13 text-accent">That alias is not allowed.</p>;
    case 'taken':
      return (
        <div>
          <p className="text-13 text-accent">Taken. Try one of these:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onPick(s)}
                className="rounded-full border-hairline px-3 py-1 font-mono text-13 text-text-secondary hover:border-hairline-active hover:text-text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      );
  }
}
