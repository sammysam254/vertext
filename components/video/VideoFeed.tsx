'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { CommentsSheet } from './CommentsSheet';
import { Video } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { recordAdImpression } from '@/lib/earnings';
import { useAuth } from '@/context/AuthContext';

const PRELOAD_AHEAD = 2;
const AD_EVERY_N_VIDEOS = 5;

interface VideoFeedProps {
  initialVideos: Video[];
  feedType?: 'foryou' | 'following';
}

export function VideoFeed({ initialVideos, feedType = 'foryou' }: VideoFeedProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentVideo, setCommentVideo] = useState<Video | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const adCountRef = useRef(0);

  // Intersection observer to track current video
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setCurrentIndex(index);
            adCountRef.current++;
            // Trigger interstitial ad every 5th video
            if (adCountRef.current % AD_EVERY_N_VIDEOS === 0 && user) {
              const video = videos[index];
              if (video) {
                recordAdImpression({
                  videoId: video.id,
                  creatorId: video.user_id,
                  adNetwork: 'monetag',
                  adType: 'interstitial',
                  platformRevenueKes: 0.05,
                });
              }
            }
          }
        });
      },
      { threshold: 0.7, root: container }
    );

    const items = container.querySelectorAll('[data-index]');
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [videos, user]);

  // Load more videos when near end
  const loadMore = useCallback(async () => {
    if (videos.length === 0) return;
    const { data } = await supabase
      .from('videos')
      .select('*, profiles(*)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(videos.length, videos.length + 9);
    if (data && data.length > 0) {
      setVideos(v => [...v, ...data]);
    }
  }, [videos.length]);

  useEffect(() => {
    if (currentIndex >= videos.length - 3) loadMore();
  }, [currentIndex, loadMore, videos.length]);

  if (videos.length === 0) {
    return (
      <div className="h-dvh flex items-center justify-center text-[#888]">
        <div className="text-center">
          <p className="text-4xl mb-3">🎬</p>
          <p>No videos yet. Be the first to post!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="snap-feed scrollbar-hide h-dvh"
      >
        {videos.map((video, index) => (
          <div key={video.id} data-index={index} className="snap-item">
            <VideoPlayer
              video={video}
              isActive={index === currentIndex}
              shouldPreload={index > currentIndex && index <= currentIndex + PRELOAD_AHEAD}
              onComment={setCommentVideo}
            />
          </div>
        ))}
      </div>

      {commentVideo && (
        <CommentsSheet video={commentVideo} onClose={() => setCommentVideo(null)} />
      )}
    </>
  );
}
