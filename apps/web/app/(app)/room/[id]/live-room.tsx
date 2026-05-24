'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { GamePhase, RoomSnapshot } from '@verdict/shared';
import { useRoom } from '@/lib/socket/use-room';
import { RoomStage } from '@/components/game/room-stage';
import { sounds } from '@/lib/sounds';

interface Props {
  roomId: string;
  selfUserId: string;
}

export function LiveRoom({ roomId, selfUserId }: Props) {
  const { snapshot, status, rebuttals, submitStatement, submitVote, changeVote, upvote, sendRebuttal, report } =
    useRoom(roomId);

  // Preload sounds once on mount.
  useEffect(() => {
    sounds.preloadAll();
  }, []);

  // Fire haptics on phase transitions. Each GamePhases component handles its
  // own enter-sounds; the vibration here is a tactile confirmation at the seam.
  const prevPhaseRef = useRef<GamePhase | null>(null);
  useEffect(() => {
    if (!snapshot) return;
    const prev = prevPhaseRef.current;
    const next = snapshot.phase;
    if (prev !== null && prev !== next) {
      navigator.vibrate?.(12);
    }
    prevPhaseRef.current = next;
  }, [snapshot?.phase]);

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

  // Participant IDs are DB UUIDs. Find self by matching the auth userId field.
  const selfParticipantId =
    snapshot.participants.find((p) => p.userId === selfUserId)?.id ?? '';

  return (
    <RoomStage
      state={snapshotToGameState(snapshot)}
      selfId={selfParticipantId}
      remainingMs={
        snapshot.phaseEndsAt
          ? Math.max(0, new Date(snapshot.phaseEndsAt).getTime() - Date.now())
          : 0
      }
      handlers={{
        onSubmitStatement: submitStatement,
        onSubmitVote: submitVote,
        onChangeVote: changeVote,
        onUpvote: upvote,
        onSendRebuttal: sendRebuttal,
        onReport: report,
      }}
      homeHref="/home"
      roomId={roomId}
      selfUserId={selfUserId}
      rebuttals={rebuttals}
    />
  );
}

function deriveMinoritySide(snap: RoomSnapshot): 'a' | 'b' | 'tie' {
  // During and after reveal the server sets resultMajoritySide. The minority is
  // the opposite. 'hung' and 'unanimous' both map to 'tie' for display purposes.
  if (snap.resultMajoritySide === 'a') return 'b';
  if (snap.resultMajoritySide === 'b') return 'a';
  // Before result is set, derive from the current vote distribution.
  const aCount = snap.participants.filter((p) => p.vote === 'a').length;
  const bCount = snap.participants.filter((p) => p.vote === 'b').length;
  if (aCount === bCount) return 'tie';
  return aCount < bCount ? 'a' : 'b';
}

const REVEAL_PHASES: GamePhase[] = ['reveal', 'debate', 'conversion', 'result', 'completed'];

function snapshotToGameState(snap: RoomSnapshot): import('@verdict/shared').GameState {
  const now = Date.now();
  const phaseEndsAt = snap.phaseEndsAt ? new Date(snap.phaseEndsAt).getTime() : now;
  const needsRevealSnapshot = REVEAL_PHASES.includes(snap.phase);
  const participants = snap.participants.map((p) => ({
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
  }));

  return {
    phase: snap.phase,
    phaseStartedAt: now,
    phaseEndsAt,
    scenario: snap.scenario,
    participants,
    revealSnapshot: needsRevealSnapshot
      ? {
          aIds: participants.filter((p) => (p.initialVote ?? p.vote) === 'a').map((p) => p.id),
          bIds: participants.filter((p) => (p.initialVote ?? p.vote) === 'b').map((p) => p.id),
          minoritySide: deriveMinoritySide(snap),
        }
      : null,
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
