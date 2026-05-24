'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { track } from '@/lib/analytics/posthog';

interface Comment {
  id: string;
  parent_id: string | null;
  author_id: string;
  author_alias: string;
  body: string;
  upvotes: number;
  created_at: string;
}

interface Props {
  roomId: string;
  selfUserId: string;
  selfAlias: string;
}

export function CommentThread({ roomId, selfUserId, selfAlias }: Props) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [posting, setPosting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    async function load() {
      const { data } = await db
        .from('room_comments')
        .select('id, parent_id, author_id, body, upvotes, created_at, profiles!author_id(alias)')
        .eq('room_id', roomId)
        .is('archived_at', null)
        .order('created_at', { ascending: true });

      if (data) {
        setComments(data.map((r: any) => ({
          ...r,
          author_alias: r.profiles?.alias ?? 'unknown',
        })));
      }
    }
    load();

    const channel = supabase
      .channel(`room_comments:${roomId}`)
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'room_comments', filter: `room_id=eq.${roomId}` },
        async (payload: any) => {
          const row = payload.new;
          const { data: profile } = await db
            .from('profiles')
            .select('alias')
            .eq('id', row.author_id)
            .single();
          setComments((prev: Comment[]) => [
            ...prev,
            { ...row, author_alias: profile?.alias ?? 'unknown' },
          ]);
        },
      )
      .on(
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'room_comments', filter: `room_id=eq.${roomId}` },
        (payload: any) => {
          const updated = payload.new;
          setComments((prev: Comment[]) =>
            prev.map((c) => (c.id === updated.id ? { ...c, upvotes: updated.upvotes } : c)),
          );
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  async function handlePost() {
    const text = draft.trim();
    if (!text || posting) return;
    setPosting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('room_comments').insert({
      room_id: roomId,
      author_id: selfUserId,
      parent_id: replyTo?.id ?? null,
      body: text,
    });
    track('comment_posted', {
      room_id: roomId,
      is_reply: !!replyTo,
      char_count: text.length,
    });
    setDraft('');
    setReplyTo(null);
    setPosting(false);
  }

  async function handleUpvote(comment: Comment) {
    if (upvotedIds.has(comment.id)) return;
    setUpvotedIds((prev) => new Set(prev).add(comment.id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('room_comments')
      .update({ upvotes: comment.upvotes + 1 })
      .eq('id', comment.id);
  }

  function startReply(comment: Comment) {
    setReplyTo(comment);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const roots = comments.filter((c) => !c.parent_id);
  const replies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <p style={{
        fontSize: 11,
        fontFamily: 'var(--font-mono-display)',
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 12,
      }}>
        Courtroom thread
      </p>

      {/* Comment list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <AnimatePresence initial={false}>
          {roots.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CommentCard
                comment={comment}
                isSelf={comment.author_id === selfUserId}
                upvoted={upvotedIds.has(comment.id)}
                onUpvote={() => handleUpvote(comment)}
                onReply={() => startReply(comment)}
              />
              {/* Threaded replies — one level deep */}
              {replies(comment.id).map((reply) => (
                <div key={reply.id} style={{ marginLeft: 20, marginTop: 6 }}>
                  <CommentCard
                    comment={reply}
                    isSelf={reply.author_id === selfUserId}
                    upvoted={upvotedIds.has(reply.id)}
                    onUpvote={() => handleUpvote(reply)}
                    isReply
                    replyToAlias={comment.author_alias}
                  />
                </div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>

        {roots.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px 0' }}>
            No comments yet. Be the first.
          </p>
        )}
      </div>

      {/* Composer */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '0.5px solid var(--border-subtle)',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        {replyTo && (
          <div style={{
            padding: '6px 12px',
            background: 'var(--bg-tertiary)',
            borderBottom: '0.5px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono-display)', color: 'var(--text-secondary)' }}>
              Replying to @{replyTo.author_alias}
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-tertiary)', padding: 0 }}
            >
              ✕
            </button>
          </div>
        )}
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 500))}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost(); }}
          placeholder={replyTo ? `Reply to @${replyTo.author_alias}…` : 'Add to the verdict…'}
          rows={2}
          style={{
            width: '100%',
            resize: 'none',
            background: 'transparent',
            border: 'none',
            padding: '10px 12px',
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
        <div style={{ padding: '0 12px 10px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handlePost}
            disabled={!draft.trim() || posting}
            style={{
              height: 32,
              padding: '0 14px',
              borderRadius: 6,
              border: 'none',
              background: draft.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: draft.trim() ? 'var(--bg-primary)' : 'var(--text-tertiary)',
              fontSize: 12,
              fontWeight: 500,
              cursor: draft.trim() ? 'pointer' : 'default',
              fontFamily: 'inherit',
              transition: 'background 0.1s',
            }}
          >
            {posting ? '…' : replyTo ? 'Reply' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentCard({
  comment,
  isSelf,
  upvoted,
  onUpvote,
  onReply,
  isReply = false,
  replyToAlias,
}: {
  comment: Comment;
  isSelf: boolean;
  upvoted: boolean;
  onUpvote: () => void;
  onReply?: () => void;
  isReply?: boolean;
  replyToAlias?: string;
}) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '0.5px solid var(--border-subtle)',
      borderLeft: isReply ? '2px solid var(--border-subtle)' : '0.5px solid var(--border-subtle)',
      borderRadius: 8,
      padding: '8px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{
          fontFamily: 'var(--font-mono-display)',
          fontSize: 11,
          color: isSelf ? 'var(--accent)' : 'var(--text-secondary)',
        }}>
          @{comment.author_alias}
          {isSelf && <span style={{ marginLeft: 6, color: 'var(--text-tertiary)' }}>· you</span>}
        </span>
        <span style={{ fontFamily: 'var(--font-mono-display)', fontSize: 10, color: 'var(--text-tertiary)' }}>
          {formatAge(comment.created_at)}
        </span>
      </div>
      {isReply && replyToAlias && (
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2 }}>↳ @{replyToAlias}</p>
      )}
      <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)' }}>{comment.body}</p>
      <div style={{ marginTop: 6, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="button"
          onClick={onUpvote}
          disabled={upvoted}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: upvoted ? 'default' : 'pointer',
            padding: 0,
            color: upvoted ? 'var(--accent)' : 'var(--text-tertiary)',
            fontSize: 11,
            fontFamily: 'var(--font-mono-display)',
          }}
        >
          <ArrowUp size={12} strokeWidth={2} />
          {comment.upvotes > 0 ? comment.upvotes : ''}
        </button>
        {!isReply && onReply && (
          <button
            type="button"
            onClick={onReply}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: 'var(--text-tertiary)',
              fontSize: 11,
              fontFamily: 'var(--font-mono-display)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Reply
          </button>
        )}
      </div>
    </div>
  );
}

function formatAge(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
}
