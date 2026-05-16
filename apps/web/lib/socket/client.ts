'use client';

import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@verdict/shared';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

/** Returns (or creates) the singleton Socket.io connection.
 *  Automatically attaches the Supabase session token as the auth handshake. */
export async function getSocket(): Promise<AppSocket> {
  if (socket?.connected) return socket;

  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';

  const url = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

  socket = io(url, {
    transports: ['websocket'],
    auth: { token },
    autoConnect: false,
  }) as AppSocket;

  socket.connect();
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
