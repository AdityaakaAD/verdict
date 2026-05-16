'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSocket, disconnectSocket } from '@/lib/socket/client';

interface Props { region: string }

type Status = 'connecting' | 'queued' | 'found' | 'error';

export function MatchmakingClient({ region }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('connecting');
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const cancelledRef = useRef(false);

  useEffect(() => {
    let sock: Awaited<ReturnType<typeof getSocket>> | null = null;

    async function init() {
      try {
        sock = await getSocket();
        if (cancelledRef.current) return;

        sock.emit('join_queue', { region }, (res) => {
          if (cancelledRef.current) return;
          if (!res || !res.ok) { setStatus('error'); return; }
          setStatus('queued');
          startRef.current = Date.now();
        });

        sock.on('room_ready', ({ roomId }) => {
          if (cancelledRef.current) return;
          setStatus('found');
          setTimeout(() => router.push(`/room/${roomId}`), 400);
        });

        sock.on('error', () => {
          if (!cancelledRef.current) setStatus('error');
        });
      } catch {
        if (!cancelledRef.current) setStatus('error');
      }
    }

    init();

    const ticker = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);

    return () => {
      cancelledRef.current = true;
      clearInterval(ticker);
      sock?.emit('leave_queue');
      sock?.off('room_ready');
      sock?.off('error');
    };
  }, [region, router]);

  const dots = '.'.repeat((elapsed % 3) + 1).padEnd(3, ' ');

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {status === 'connecting' && (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-accent" />
          <p className="text-15 text-text-secondary">Connecting{dots}</p>
        </>
      )}

      {status === 'queued' && (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-accent" />
          <div>
            <p className="font-serif text-22 font-medium">Finding your jury{dots}</p>
            <p className="mt-2 text-15 text-text-secondary">
              {elapsed}s elapsed · filling with bots if needed
            </p>
          </div>
          <Link
            href="/home"
            className="mt-4 text-13 text-text-tertiary underline-offset-2 hover:text-text-secondary hover:underline"
          >
            Cancel
          </Link>
        </>
      )}

      {status === 'found' && (
        <>
          <span className="text-28 font-serif font-medium text-accent">Room found.</span>
          <p className="text-15 text-text-secondary">Entering the courtroom…</p>
        </>
      )}

      {status === 'error' && (
        <>
          <p className="font-serif text-22 font-medium">Connection failed.</p>
          <p className="text-15 text-text-secondary">
            The real-time server may be offline. Try a practice round instead.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/room/practice"
              className="flex h-11 items-center justify-center rounded-md bg-accent px-5 text-13 font-medium text-bg-primary hover:bg-accent-hover"
            >
              Practice round
            </Link>
            <Link
              href="/home"
              className="flex h-11 items-center justify-center rounded-md border-hairline px-5 text-13 text-text-secondary hover:border-hairline-active"
            >
              Home
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
