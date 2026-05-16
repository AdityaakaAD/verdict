'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import type { Scenario } from '@verdict/shared';
import { usePracticeGame, type PracticeUser } from '@/lib/game/use-practice-game';
import { RoomStage } from '@/components/game/room-stage';
import { sounds } from '@/lib/sounds';
import { getNextScenario } from './actions';

interface Props {
  scenario: Scenario;
  user: PracticeUser;
}

export function PracticeRoom({ scenario: initialScenario, user }: Props) {
  const [scenario, setScenario] = useState(initialScenario);
  const [, startTransition] = useTransition();
  const game = usePracticeGame({ scenario, user });

  useEffect(() => {
    sounds.preloadAll();
  }, []);

  const handlePlayAgain = useCallback(() => {
    const currentId = scenario.id;
    startTransition(async () => {
      const next = await getNextScenario(currentId);
      if (next) setScenario(next);
      game.reset();
    });
  }, [scenario.id, game.reset]);

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <Link href="/home" className="font-serif text-18 font-medium tracking-tight">
          verdict
        </Link>
        <span className="text-11 text-text-tertiary label-caps">Practice</span>
      </header>

      <RoomStage
        state={game.state}
        selfId={game.userId}
        remainingMs={game.remainingMs}
        handlers={{
          onSubmitStatement: game.submitStatement,
          onSubmitVote: game.submitVote,
          onChangeVote: game.changeVote,
          onUpvote: game.upvote,
          onPlayAgain: handlePlayAgain,
        }}
      />
    </>
  );
}
