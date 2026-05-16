import Link from 'next/link';
import { AuthForm } from '@/components/shared/auth-form';

export const metadata = { title: 'Sign in — Verdict' };

export default function LoginPage({
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
        <h1 className="font-serif text-28 font-medium">Welcome back.</h1>
        <p className="mt-3 text-15 text-text-secondary">
          Sign in with the alias you registered. The courtroom remembers.
        </p>
      </section>

      <AuthForm mode="signin" next={searchParams.next} error={searchParams.error} />

      <p className="mt-10 text-13 text-text-secondary">
        New here?{' '}
        <Link href="/signup" className="text-text-primary underline-offset-4 hover:underline">
          Create an alias
        </Link>
      </p>
    </main>
  );
}
