'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRoom } from '@/lib/socket/use-room';
import { RoomStage } from '@/components/game/room-stage';
import { sounds } from '@/lib/sounds';

interface Props {
  roomId: string;
  selfUserId: string;
}

export function LiveRoom({ roomId, selfUserId }: Props) {
  const { snapshot, status, submitStatement, submitVote, changeVote, upvote } = useRoom(roomId);

  useEffect(() => {
    sounds.preloadAll();
  }, []);

  if (status === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-accent" />
        <p className="text-15 text-text-secondary">Joining the courtroom…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="py-16">
        <p className="font-serif text-22 font-medium">Lost connection.</p>
        <p className="mt-3 text-15 text-text-secondary">
          The room may have ended or the server is unreachable.
        </p>
        <Link
          href="/home"
          className="mt-8 flex h-12 items-center justify-center rounded-md border-hairline text-15 text-text-primary hover:border-hairline-active"
        >
          Back to home
        </Link>
      </div>
    );
  }

  if (!snapshot) return null;

  // Map RoomSnapshot → GameState shape expected by RoomStage.
  // RoomStage accepts GameState; we adapt the snapshot here so the same
  // component tree works for both practice and live modes.
  const selfParticipantId = `player_${selfUserId}`;

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <Link href="/home" className="font-serif text-18 font-medium tracking-tight">
          verdict
        </Link>
        <span className="text-11 text-text-tertiary label-caps">Live</span>
      </header>

      <RoomStage
        state={snapshotToGameState(snapshot)}
        selfId={selfParticipantId}
        remainingMs={snapshot.phaseEndsAt ? new Date(snapshot.phaseEndsAt).getTime() - Date.now() : 0}
        handlers={{ onSubmitStatement: submitStatement, onSubmitVote: submitVote, onChangeVote: changeVote, onUpvote: upvote }}
        homeHref="/home"
      />
    </>
  );
}

function snapshotToGameState(snap: import('@verdict/shared').RoomSnapshot): import('@verdict/shared').GameState {
  const now = Date.now();
  const phaseEndsAt = snap.phaseEndsAt ? new Date(snap.phaseEndsAt).getTime() : now;
  return {
    phase: snap.phase,
    phaseStartedAt: now,
    phaseEndsAt,
    scenario: snap.scenario,
    participants: snap.participants.map((p) => ({
      id: p.id,
      userId: p.userId,
      isBot: p.isBot,
      botPersona: p.botPersona,
      alias: p.alias,
      avatarId: p.avatarId,
      tier: p.tier,
      statement: p.statement,
      vote: p.vote,
      initialVote: p.initialVote,
      changedVoteDuringConversion: p.changedVoteDuringConversion,
      wasMinority: p.wasMinority,
      conversionsMade: p.conversionsMade,
      statementUpvotes: p.statementUpvotes,
      scoreDelta: p.scoreDelta,
      isConnected: p.isConnected,
    })),
    revealSnapshot: null,
    result: snap.resultMajoritySide
      ? {
          majorityOutcome: snap.resultMajoritySide,
          minorityWon: snap.resultMinorityWon ?? false,
          totalConversions: snap.totalConversions,
          voteBreakdown: {
            a: snap.participants.filter((p) => p.vote === 'a').length,
            b: snap.participants.filter((p) => p.vote === 'b').length,
          },
          topStatement: null,
        }
      : null,
  };
}
