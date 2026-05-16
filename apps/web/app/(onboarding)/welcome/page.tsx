'use client';

import Link from 'next/link';

export default function WelcomePage() {
  return (
    <section className="flex h-full flex-col pt-24">
      <p className="text-11 text-text-secondary label-caps">
        <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-accent align-middle" aria-hidden />
        Welcome
      </p>
      <h1 className="mt-4 font-serif text-36 font-medium leading-tight">
        Judge the world.
        <br />
        Be judged by it.
      </h1>
      <p className="mt-6 max-w-[36ch] text-15 text-text-secondary">
        Six strangers. One scenario. Five minutes to decide who got it right.
      </p>

      <div className="mt-auto pt-16">
        <Link
          href="/interests"
          className="flex h-12 w-full items-center justify-center rounded-md bg-accent text-15 font-medium text-bg-primary transition-colors duration-100 hover:bg-accent-hover"
        >
          Begin
        </Link>
      </div>
    </section>
  );
}
