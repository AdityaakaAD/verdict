import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[400px] flex-col items-start justify-center px-6">
      <p className="text-11 text-text-secondary label-caps">404</p>
      <h1 className="mt-3 font-serif text-28 font-medium">Out of session.</h1>
      <p className="mt-3 text-15 text-text-secondary">
        The page you’re looking for doesn’t exist or has been retired.
      </p>
      <Link
        href="/home"
        className="mt-10 flex h-12 items-center justify-center rounded-md border-hairline px-6 text-15 transition-colors hover:border-hairline-active"
      >
        Back to the courtroom
      </Link>
    </main>
  );
}
