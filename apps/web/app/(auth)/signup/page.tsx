import Link from 'next/link';
import { AuthForm } from '@/components/shared/auth-form';

export const metadata = { title: 'Create an alias — Verdict' };

export default function SignupPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-[400px] flex-col px-6 pb-12 pt-20">
      <Link href="/" className="font-serif text-18 font-medium tracking-tight">
        verdict
      </Link>

      <section className="mt-20">
        <h1 className="font-serif text-28 font-medium">Reserve your seat.</h1>
        <p className="mt-3 text-15 text-text-secondary">
          Take three minutes. Pick what you care about. The courtroom opens.
        </p>
      </section>

      <AuthForm mode="signup" next={searchParams.next} error={searchParams.error} />

      <p className="mt-10 text-13 text-text-secondary">
        Already registered?{' '}
        <Link href="/login" className="text-text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>

      <p className="mt-12 max-w-[40ch] text-11 text-text-tertiary label-caps">
        By continuing you agree to our terms and privacy policy. You must be 13 or older.
      </p>
    </main>
  );
}
