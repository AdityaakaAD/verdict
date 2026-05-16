'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ParticipantState, ResultState, Scenario } from '@verdict/shared';
import { AvatarMark } from './avatar-mark';
import { sounds } from '@/lib/sounds';

interface Props {
  scenario: Scenario;
  participants: ParticipantState[];
  result: ResultState;
  selfId: string;
  /** Optional CTA for practice mode etc. */
  primaryCta?: { label: string; onClick: () => void };
  secondaryCta?: { label: string; href: string };
}

export function PhaseResult({
  scenario,
  participants,
  result,
  selfId,
  primaryCta,
  secondaryCta,
}: Props) {
  const self = participants.find((p) => p.id === selfId);
  const userWon =
    self && ((self.wasMinority && result.minorityWon) || (!self.wasMinority && !result.minorityWon));

  useEffect(() => {
    if (userWon) sounds.play('win_sting');
    else sounds.play('loss_sting');
  }, [userWon]);

  const sortedByDelta = [...participants].sort((a, b) => b.scoreDelta - a.scoreDelta);

  return (
    <section className="flex flex-col">
      <p className="text-11 text-text-secondary label-caps">
        <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-accent align-middle" aria-hidden />
        Result
      </p>
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-2 font-serif text-28 font-medium leading-tight"
      >
        {result.majorityOutcome === 'unanimous'
          ? 'Unanimous.'
          : result.majorityOutcome === 'hung'
            ? 'Hung jury.'
            : result.minorityWon
              ? 'The minority won.'
              : 'The majority held.'}
      </motion.h1>
      <p className="mt-2 max-w-[40ch] text-15 text-text-secondary">
        {scenario.contextTag ? `${scenario.contextTag}. ` : ''}
        Final split: {result.voteBreakdown.a} to {result.voteBreakdown.b}.
        {result.totalConversions > 0
          ? ` ${result.totalConversions} ${result.totalConversions === 1 ? 'juror' : 'jurors'} crossed.`
          : null}
      </p>

      {self ? (
        <div className="mt-6 rounded-md border-hairline bg-bg-secondary p-5">
          <p className="text-11 text-text-secondary label-caps">You</p>
          <p className="mt-2 font-serif text-22 font-medium">
            {userWon ? 'You were right.' : 'You were on the losing side.'}
          </p>
          <p className="mt-2 font-mono text-13 text-text-secondary">
            {self.scoreDelta >= 0 ? '+' : ''}
            {self.scoreDelta} verdict score
          </p>
        </div>
      ) : null}

      {result.topStatement ? (
        <TopStatement
          scenario={scenario}
          participants={participants}
          statement={result.topStatement}
        />
      ) : null}

      <div className="mt-6">
        <p className="text-11 text-text-secondary label-caps">Score deltas</p>
        <ul className="mt-3 space-y-2">
          {sortedByDelta.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-md border-hairline bg-bg-secondary p-3"
            >
              <AvatarMark avatarId={p.avatarId as any} size="sm" highlighted={p.id === selfId} />
              <span className="flex-1 truncate font-mono text-13 text-text-secondary">
                @{p.alias}
                {p.id === selfId ? <span className="ml-2 text-accent">· you</span> : null}
              </span>
              <span
                className="font-mono text-13 tabular-nums"
                style={{
                  color:
                    p.scoreDelta > 0
                      ? 'var(--text-primary)'
                      : p.scoreDelta < 0
                        ? 'var(--text-tertiary)'
                        : 'var(--text-secondary)',
                }}
              >
                {p.scoreDelta >= 0 ? '+' : ''}
                {p.scoreDelta}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {primaryCta ? (
          <button
            type="button"
            onClick={primaryCta.onClick}
            className="flex h-12 items-center justify-center rounded-md bg-accent text-15 font-medium text-bg-primary transition-colors duration-100 hover:bg-accent-hover"
          >
            {primaryCta.label}
          </button>
        ) : null}
        {secondaryCta ? (
          <Link
            href={secondaryCta.href}
            className="flex h-12 items-center justify-center rounded-md border-hairline text-15 text-text-primary transition-colors duration-100 hover:border-hairline-active"
          >
            {secondaryCta.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function TopStatement({
  scenario,
  participants,
  statement,
}: {
  scenario: Scenario;
  participants: ParticipantState[];
  statement: NonNullable<ResultState['topStatement']>;
}) {
  const p = participants.find((x) => x.id === statement.participantId);
  if (!p) return null;
  const sideLabel = p.vote === 'a' ? scenario.sideALabel : scenario.sideBLabel;
  return (
    <div className="mt-6 rounded-md border-l-[2px] border-hairline bg-bg-secondary p-4"
      style={{ borderLeftColor: p.vote === 'a' ? 'var(--vote-a)' : 'var(--vote-b)' }}
    >
      <p className="text-11 text-text-secondary label-caps">Top voice · {sideLabel.toLowerCase()}</p>
      <p className="mt-2 font-serif text-15 leading-relaxed text-text-primary">
        “{statement.text}”
      </p>
      <p className="mt-2 font-mono text-11 text-text-tertiary label-caps">
        @{p.alias} · {statement.upvotes} up
      </p>
    </div>
  );
}
