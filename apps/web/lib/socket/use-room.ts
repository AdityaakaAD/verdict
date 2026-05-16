'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RoomSnapshot, VoteSide } from '@verdict/shared';
import { getSocket, disconnectSocket, type AppSocket } from './client';

export type RoomStatus = 'connecting' | 'live' | 'error' | 'completed';

export interface UseRoomResult {
  snapshot: RoomSnapshot | null;
  status: RoomStatus;
  submitStatement: (text: string) => void;
  submitVote: (vote: VoteSide) => void;
  changeVote: (vote: VoteSide) => void;
  upvote: (participantId: string) => void;
  sendTyping: (isTyping: boolean) => void;
}

export function useRoom(roomId: string): UseRoomResult {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [status, setStatus] = useState<RoomStatus>('connecting');
  const socketRef = useRef<AppSocket | null>(null);

  useEffect(() => {
    let mounted = true;

    async function connect() {
      const sock = await getSocket();
      if (!mounted) return;
      socketRef.current = sock;

      sock.emit('join_room', { roomId }, (res) => {
        if (!mounted) return;
        if (res?.snapshot) {
          setSnapshot(res.snapshot);
          setStatus('live');
        } else {
          setStatus('error');
        }
      });

      sock.on('room_state', (snap) => {
        if (!mounted) return;
        setSnapshot(snap);
        if (snap.phase === 'completed') setStatus('completed');
      });

      sock.on('error', () => {
        if (!mounted) return;
        setStatus('error');
      });
    }

    connect().catch(() => setStatus('error'));

    return () => {
      mounted = false;
      socketRef.current?.emit('leave_room', { roomId });
      socketRef.current?.off('room_state');
      socketRef.current?.off('error');
    };
  }, [roomId]);

  const submitStatement = useCallback((text: string) => {
    socketRef.current?.emit('submit_statement', { roomId, text });
  }, [roomId]);

  const submitVote = useCallback((vote: VoteSide) => {
    socketRef.current?.emit('submit_vote', { roomId, vote });
  }, [roomId]);

  const changeVote = useCallback((vote: VoteSide) => {
    socketRef.current?.emit('change_vote', { roomId, vote });
  }, [roomId]);

  const upvote = useCallback((participantId: string) => {
    socketRef.current?.emit('upvote_statement', { participantId });
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    socketRef.current?.emit('typing', { roomId, isTyping });
  }, [roomId]);

  return { snapshot, status, submitStatement, submitVote, changeVote, upvote, sendTyping };
}
