import Link from 'next/link';

// Legal hub. Detailed drafts in docs/LEGAL_DRAFTS.md — those go through
// lawyer review (~₹15-25k) before production. This page renders summaries
// for users with anchor links to each section.

export const metadata = { title: 'Legal — Verdict' };

export default function LegalPage() {
  return (
    <main className="mx-auto max-w-[640px] px-6 pb-24 pt-16">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-serif text-18 font-medium">
          verdict
        </Link>
        <span className="text-11 text-text-tertiary label-caps">Legal</span>
      </header>

      <nav aria-label="Legal sections" className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-13 text-text-secondary">
        <a href="#privacy" className="hover:text-text-primary">Privacy</a>
        <a href="#terms" className="hover:text-text-primary">Terms</a>
        <a href="#guidelines" className="hover:text-text-primary">Community guidelines</a>
        <a href="#grievance" className="hover:text-text-primary">Grievance officer</a>
        <a href="#cookies" className="hover:text-text-primary">Cookies</a>
      </nav>

      <article className="mt-12 space-y-14 text-15 leading-relaxed text-text-primary">
        <Section id="privacy" title="Privacy policy" placeholder>
          Detailed policy is being finalized with counsel under the DPDP Act, 2023. The full
          document covers what we collect, why, how long we keep it, who processes it, and how
          to exercise your rights — including access, deletion, and export. A grievance officer
          is named below.
        </Section>
        <Section id="terms" title="Terms of service" placeholder>
          Use of Verdict is subject to terms covering account conduct, content rules, prohibited
          behavior, dispute resolution, and limitation of liability. Verdict is for users 13 and
          older. No real-money wagering of any kind is permitted on the service.
        </Section>
        <Section id="guidelines" title="Community guidelines" placeholder>
          Statements may be argumentative; they may not be abusive. Hate speech, harassment,
          doxxing, and explicit content are removed on report. Three warnings result in a
          24-hour ban; five result in permanent removal.
        </Section>
        <Section id="grievance" title="Grievance officer" placeholder>
          As required under the IT Rules, 2021, the grievance officer’s details and a 24-hour
          response SLA will be published here ahead of public launch.
        </Section>
        <Section id="cookies" title="Cookies and storage" placeholder>
          We use a small number of essential cookies for authentication, plus opt-in analytics
          and crash reporting. You can reject non-essential storage at any time.
        </Section>
      </article>

      <p className="mt-16 text-11 text-text-tertiary label-caps">Draft — pre-launch review pending</p>
    </main>
  );
}

function Section({
  id,
  title,
  children,
  placeholder,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  placeholder?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-serif text-22 font-medium text-text-primary">{title}</h2>
      {placeholder ? (
        <p className="mt-3 text-11 text-text-tertiary label-caps">Summary</p>
      ) : null}
      <div className="mt-4 text-text-secondary">{children}</div>
    </section>
  );
}
