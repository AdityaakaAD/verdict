import Link from 'next/link';

// Marketing landing — the only public-facing page outside auth/legal. Speaks
// in product voice: editorial, weighty, no exclamation marks, no emoji. The
// page makes three moats visible above the fold: scarcity (tonight's
// scenario), curiosity (yesterday's split), and live presence (rooms in
// session).

export default function MarketingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col px-6 pb-16 pt-20">
      <header className="flex items-center gap-2">
        <span className="font-serif text-22 font-medium tracking-tight">verdict</span>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
      </header>

      <section className="mt-24">
        <h1 className="font-serif text-36 font-medium leading-tight">
          Judge the world.
          <br />
          Be judged by it.
        </h1>
        <p className="mt-6 max-w-[36ch] text-15 text-text-secondary">
          Each night, a scenario drops. Strangers argue. Someone is on the wrong side of the room.
          Five minutes. One verdict.
        </p>
      </section>

      <section className="mt-16 space-y-6">
        <Row label="Tonight" value="9:00 pm" />
        <Row label="Region" value="India" />
        <Row label="In session" value="—" />
      </section>

      <div className="mt-auto flex flex-col gap-3 pt-16">
        <Link
          href="/signup"
          className="flex h-12 items-center justify-center rounded-md border-hairline-accent bg-accent text-15 font-medium text-bg-primary transition-colors duration-100 hover:bg-accent-hover"
        >
          Reserve your seat
        </Link>
        <Link
          href="/login"
          className="flex h-12 items-center justify-center rounded-md border-hairline text-15 text-text-primary transition-colors duration-100 hover:border-hairline-active"
        >
          I already have an alias
        </Link>
      </div>

      <footer className="mt-16 flex items-center justify-between text-11 text-text-tertiary label-caps">
        <Link href="/legal#privacy">Privacy</Link>
        <span className="h-1 w-1 rounded-full bg-text-tertiary" aria-hidden />
        <Link href="/legal#terms">Terms</Link>
        <span className="h-1 w-1 rounded-full bg-text-tertiary" aria-hidden />
        <Link href="/legal#guidelines">Guidelines</Link>
      </footer>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b-hairline pb-3">
      <span className="text-11 text-text-secondary label-caps">{label}</span>
      <span className="font-mono text-13 text-text-primary">{value}</span>
    </div>
  );
}
