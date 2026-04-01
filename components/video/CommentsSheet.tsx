'use client';
import { useState, useEffect } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { Video, Comment } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface CommentsSheetProps {
  video: Video;
  onClose: () => void;
}

export function CommentsSheet({ video, onClose }: CommentsSheetProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [video.id]);

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(*)')
      .eq('video_id', video.id)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .limit(50);
    setComments(data ?? []);
  }

  async function submitComment() {
    if (!user || !text.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        video_id: video.id,
        content: text.trim(),
      });
      if (error) throw error;
      setText('');
      await fetchComments();
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-[#111] rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]">
          <span className="font-semibold">{video.comment_count} comments</span>
          <button onClick={onClose}><X size={20} className="text-[#888]" /></button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#222] shrink-0 flex items-center justify-center text-xs text-[#00C853] font-bold">
                {comment.profiles?.username?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-[#00C853]">@{comment.profiles?.username}</span>
                <p className="text-sm text-white mt-0.5">{comment.content}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-[#555]">{timeAgo(comment.created_at)}</span>
                  <button className="flex items-center gap-1 text-xs text-[#555]">
                    <Heart size={12} /> {comment.like_count}
                  </button>
                  <button className="text-xs text-[#555]">Reply</button>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-[#555] py-8">No comments yet. Be the first!</p>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 p-4 border-t border-[#222]">
          <div className="w-8 h-8 rounded-full bg-[#222] shrink-0 flex items-center justify-center text-xs text-[#00C853] font-bold">
            {profile?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-[#1A1A1A] rounded-full px-4 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:ring-1 focus:ring-[#00C853]"
            onKeyDown={e => e.key === 'Enter' && submitComment()}
          />
          <button
            onClick={submitComment}
            disabled={!text.trim() || loading}
            className="text-[#00C853] disabled:opacity-30"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
