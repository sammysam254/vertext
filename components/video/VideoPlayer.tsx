'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Music2, Volume2, VolumeX } from 'lucide-react';
import { Video } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { simulateAdRevenue } from '@/lib/earnings';

interface VideoPlayerProps {
  video: Video;
  isActive: boolean;
  shouldPreload: boolean;
  onComment?: (video: Video) => void;
}

export function VideoPlayer({ video, isActive, shouldPreload, onComment }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.like_count);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [progress, setProgress] = useState(0);
  const [showPause, setShowPause] = useState(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef(0);
  const viewRecorded = useRef(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      el.currentTime = 0;
      el.play().catch(() => {});
      if (!viewRecorded.current) {
        viewRecorded.current = true;
        recordView();
        if (user) simulateAdRevenue(video.id, video.user_id);
      }
    } else {
      el.pause();
    }
  }, [isActive]);

  async function recordView() {
    await fetch('/api/videos/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: video.id,
        viewerId: user?.id ?? null,
        watchDuration: 0,
        completed: false,
      }),
    });
  }

  useEffect(() => {
    if (!user) return;
    supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('video_id', video.id)
      .single()
      .then(({ data }) => setLiked(!!data));
  }, [user, video.id]);

  const handleLike = useCallback(async () => {
    if (!user) {
      console.log('User not logged in, cannot like');
      return;
    }
    
    try {
      console.log('Like button clicked, current state:', liked);
      
      if (liked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', video.id);
        
        if (error) throw error;
        
        setLiked(false);
        setLikeCount(c => c - 1);
        
        // Update profile total likes
        await supabase.rpc('decrement_user_likes', { p_user_id: video.user_id });
        console.log('Unliked successfully');
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, video_id: video.id });
        
        if (error) throw error;
        
        setLiked(true);
        setLikeCount(c => c + 1);
        
        // Update profile total likes
        await supabase.rpc('increment_user_likes', { p_user_id: video.user_id });
        console.log('Liked successfully');
      }
    } catch (error) {
      console.error('Like error:', error);
      alert('Failed to like video. Please try again.');
    }
  }, [user, liked, video.id, video.user_id]);

  const handleShare = useCallback(async () => {
    try {
      console.log('Share button clicked');
      
      const shareUrl = `${window.location.origin}/video/${video.id}`;
      const shareData = {
        title: 'Check out this video on Vertex',
        text: video.description || 'Watch this video on Vertex',
        url: shareUrl,
      };
      
      console.log('Share data:', shareData);
      
      if (navigator.share) {
        console.log('Using native share');
        await navigator.share(shareData);
        console.log('Share successful');
      } else {
        console.log('Using clipboard fallback');
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
      
      // Increment share count
      const { error } = await supabase
        .from('videos')
        .update({ share_count: video.share_count + 1 })
        .eq('id', video.id);
      
      if (error) {
        console.error('Failed to update share count:', error);
      } else {
        console.log('Share count updated');
      }
    } catch (error) {
      console.error('Share error:', error);
      // If share was cancelled, don't show error
      if (error instanceof Error && error.name !== 'AbortError') {
        alert('Failed to share. Please try again.');
      }
    }
  }, [video]);

  function handleTap(e: React.MouseEvent) {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap — like + heart animation
      if (tapTimer.current) clearTimeout(tapTimer.current);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const id = Date.now();
      setHearts(h => [...h, { id, x }]);
      setTimeout(() => setHearts(h => h.filter(heart => heart.id !== id)), 1000);
      if (!liked) handleLike();
    } else {
      tapTimer.current = setTimeout(() => {
        // Single tap — toggle pause
        const el = videoRef.current;
        if (!el) return;
        if (el.paused) { el.play(); setShowPause(false); }
        else { el.pause(); setShowPause(true); }
      }, 300);
    }
    lastTap.current = now;
  }

  function handleTimeUpdate() {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    setProgress(el.currentTime / el.duration);
  }

  const creator = video.profiles;

  return (
    <div className="snap-item relative w-full h-dvh bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src={video.video_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={muted}
        playsInline
        preload={shouldPreload ? 'auto' : 'none'}
        onTimeUpdate={handleTimeUpdate}
        onClick={handleTap}
      />

      {/* Pause indicator */}
      {showPause && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[18px] border-transparent border-l-white ml-1" />
          </div>
        </div>
      )}

      {/* Floating hearts */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute animate-float-heart pointer-events-none text-[#00C853] text-5xl"
          style={{ left: heart.x - 24, bottom: '40%' }}
        >
          ♥
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Bottom info */}
      <div className="absolute bottom-20 left-4 right-16 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-white">@{creator?.username ?? 'creator'}</span>
          {creator?.is_verified && <span className="text-[#00C853] text-xs">✓</span>}
        </div>
        {video.description && (
          <p className="text-sm text-white/90 line-clamp-2">{video.description}</p>
        )}
        {video.hashtags && video.hashtags.length > 0 && (
          <p className="text-sm text-[#00C853] mt-1">
            {video.hashtags.map(h => `#${h}`).join(' ')}
          </p>
        )}
        {/* Music ticker */}
        <div className="flex items-center gap-2 mt-2 overflow-hidden">
          <Music2 size={12} className="text-white shrink-0" />
          <div className="overflow-hidden">
            <p className="text-xs text-white/70 whitespace-nowrap animate-ticker">
              Original Sound · {creator?.username ?? 'creator'} &nbsp;&nbsp;&nbsp; Original Sound · {creator?.username ?? 'creator'}
            </p>
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        {/* Avatar */}
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-[#222] border-2 border-[#00C853] overflow-hidden">
            {creator?.avatar_url ? (
              <img src={creator.avatar_url} alt={creator.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#00C853] font-bold">
                {creator?.username?.[0]?.toUpperCase() ?? 'V'}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#00C853] rounded-full flex items-center justify-center">
            <span className="text-black text-xs font-bold">+</span>
          </div>
        </div>

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <Heart
            size={28}
            className={liked ? 'text-[#00C853] fill-[#00C853]' : 'text-white'}
            strokeWidth={2}
          />
          <span className="text-xs text-white">{formatCount(likeCount)}</span>
        </button>

        {/* Comment */}
        <button onClick={() => onComment?.(video)} className="flex flex-col items-center gap-1">
          <MessageCircle size={28} className="text-white" strokeWidth={2} />
          <span className="text-xs text-white">{formatCount(video.comment_count)}</span>
        </button>

        {/* Bookmark */}
        <button className="flex flex-col items-center gap-1">
          <Bookmark size={28} className="text-white" strokeWidth={2} />
          <span className="text-xs text-white">Save</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <Share2 size={28} className="text-white" strokeWidth={2} />
          <span className="text-xs text-white">{formatCount(video.share_count)}</span>
        </button>

        {/* Mute */}
        <button onClick={() => setMuted(m => !m)} className="flex flex-col items-center gap-1">
          {muted ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-16 left-0 right-0 h-0.5 bg-white/20">
        <div
          className="h-full bg-[#00C853] transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
