// Share card image generator. Produces a 1200x630 PNG that renders the
// scenario, the global split, and the user's role in it. Uses @vercel/og
// (Satori under the hood) so it runs on the Vercel Edge runtime.
//
// URL: /api/share-card/[roomId]
// Public — no auth required, so any user can preview/download a shareable
// card for a completed round. Only completed rooms are renderable.

import { ImageResponse } from '@vercel/og';
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface RoomRow {
  id: string;
  state: string;
  result_majority_side: string | null;
  result_minority_won: boolean | null;
  total_conversions: number;
  scenarios: {
    text: string;
    question: string;
    context_tag: string | null;
    side_a_label: string;
    side_b_label: string;
  } | null;
}

interface CountRow {
  vote: string | null;
}

export async function GET(_request: NextRequest, { params }: { params: { roomId: string } }) {
  const supabase = createClient();

  const { data: room } = await supabase
    .from('rooms')
    .select(
      'id, state, result_majority_side, result_minority_won, total_conversions, scenarios(text, question, context_tag, side_a_label, side_b_label)',
    )
    .eq('id', params.roomId)
    .maybeSingle<RoomRow>();

  if (!room || room.state !== 'completed' || !room.scenarios) {
    return new Response('Not Found', { status: 404 });
  }

  const { data: votes } = await supabase
    .from('room_participants')
    .select('vote')
    .eq('room_id', params.roomId)
    .returns<CountRow[]>();
  const aCount = (votes ?? []).filter((v) => v.vote === 'a').length;
  const bCount = (votes ?? []).filter((v) => v.vote === 'b').length;

  const scenario = room.scenarios;
  const trimmed = scenario.text.length > 240 ? scenario.text.slice(0, 237) + '…' : scenario.text;

  const verdict =
    room.result_majority_side === 'unanimous'
      ? 'Unanimous'
      : room.result_majority_side === 'hung'
        ? 'Hung jury'
        : room.result_majority_side === 'a'
          ? scenario.side_a_label
          : scenario.side_b_label;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0b',
          color: '#f8f7f4',
          padding: '64px 72px',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '34px', fontWeight: 500, letterSpacing: '-0.01em' }}>
            verdict
          </span>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '9999px',
              backgroundColor: '#ff3b30',
              display: 'block',
            }}
          />
          {scenario.context_tag ? (
            <span
              style={{
                marginLeft: '20px',
                fontSize: '13px',
                color: '#888782',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontFamily: 'sans-serif',
              }}
            >
              {scenario.context_tag}
            </span>
          ) : null}
        </div>

        <div
          style={{
            marginTop: '48px',
            fontSize: '32px',
            lineHeight: '44px',
            color: '#f8f7f4',
            maxWidth: '1050px',
            display: 'flex',
          }}
        >
          {trimmed}
        </div>

        <div
          style={{
            marginTop: '36px',
            fontSize: '28px',
            color: '#f8f7f4',
            display: 'flex',
          }}
        >
          {scenario.question}
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #1f1f23',
            paddingTop: '32px',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span
              style={{
                fontSize: '13px',
                color: '#888782',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              The verdict
            </span>
            <span style={{ fontSize: '36px', color: '#f8f7f4', fontFamily: 'serif' }}>
              {verdict}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '40px', fontFamily: 'monospace' }}>
            <SplitNumber count={aCount} label={scenario.side_a_label} color="#ff3b30" />
            <SplitNumber count={bCount} label={scenario.side_b_label} color="#2d7ff9" />
            {room.total_conversions > 0 ? (
              <SplitNumber
                count={room.total_conversions}
                label="Crossed"
                color="#f8f7f4"
              />
            ) : null}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

function SplitNumber({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
      <span style={{ fontSize: '48px', color, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      <span style={{ fontSize: '13px', color: '#888782' }}>{label}</span>
    </div>
  );
}
