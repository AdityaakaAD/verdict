// Converts the internal GameState to the RoomSnapshot shape the client expects.

import type { GameState, RoomSnapshot, Participant } from '@verdict/shared';

export function stateToSnapshot(roomId: string, state: GameState): RoomSnapshot {
  const scenario = state.scenario!;
  return {
    id: roomId,
    scenario,
    type: 'quick_match',
    phase: state.phase,
    phaseEndsAt: new Date(state.phaseEndsAt).toISOString(),
    participants: state.participants.map((p): Participant => ({
      id: p.id,
      roomId,
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
    inviteCode: null,
    region: 'IN',
    resultMajoritySide: state.result?.majorityOutcome ?? null,
    resultMinorityWon: state.result?.minorityWon ?? null,
    totalConversions: state.result?.totalConversions ?? 0,
  };
}
