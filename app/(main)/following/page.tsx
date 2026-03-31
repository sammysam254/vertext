'use client';
import { useEffect, useState } from 'react';
import { VideoFeed } from '@/components/video/VideoFeed';
import { FeedTabs } from '@/components/layout/FeedTabs';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Video } from '@/lib/types';
import Link from 'next/link';

export default function FollowingPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setLoaded(true); return; }
    async function load() {
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user!.id);

      const ids = follows?.map(f => f.following_id) ?? [];
      if (ids.length === 0) { setLoaded(true); return; }

      const { data } = await supabase
        .from('videos')
        .select('*, profiles(*)')
        .in('user_id', ids)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      setVideos(data ?? []);
      setLoaded(true);
    }
    load();
  }, [user]);

  return (
    <div className="relative h-dvh">
      <FeedTabs />
      {!loaded ? (
        <div className="h-dvh flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !user ? (
        <div className="h-dvh flex items-center justify-center text-center px-8">
          <div>
            <p className="text-2xl mb-2">👋</p>
            <p className="text-[#888] mb-4">Sign in to see videos from creators you follow</p>
            <Link href="/login" className="bg-[#00C853] text-black px-6 py-2 rounded-full font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      ) : (
        <VideoFeed initialVideos={videos} feedType="following" />
      )}
    </div>
  );
}
