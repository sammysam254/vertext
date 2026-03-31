'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Video } from '@/lib/types';
import { Settings, Grid3X3, Heart, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

type Tab = 'videos' | 'liked' | 'saved';

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('videos');
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    if (!user) return;
    loadVideos();
  }, [user, tab]);

  async function loadVideos() {
    if (!user) return;
    if (tab === 'videos') {
      const { data } = await supabase.from('videos').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setVideos(data ?? []);
    } else if (tab === 'liked') {
      const { data: likes } = await supabase.from('likes').select('video_id').eq('user_id', user.id).limit(30);
      const ids = likes?.map(l => l.video_id).filter(Boolean) ?? [];
      if (ids.length === 0) { setVideos([]); return; }
      const { data } = await supabase.from('videos').select('*').in('id', ids);
      setVideos(data ?? []);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  if (loading) return <div className="h-dvh flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" /></div>;

  if (!user || !profile) {
    return (
      <div className="h-dvh flex items-center justify-center text-center px-8">
        <div>
          <p className="text-[#888] mb-4">Sign in to view your profile</p>
          <Link href="/login" className="bg-[#00C853] text-black px-6 py-2 rounded-full font-semibold">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-y-auto scrollbar-hide bg-[#0A0A0A] pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <h1 className="font-bold text-lg">@{profile.username}</h1>
        <div className="flex gap-3">
          <Link href="/notifications"><span className="text-[#888]">🔔</span></Link>
          <button onClick={handleSignOut} className="text-[#888]"><Settings size={20} /></button>
        </div>
      </div>

      {/* Avatar + stats */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-[#222] border-2 border-[#00C853] overflow-hidden flex items-center justify-center text-2xl font-bold text-[#00C853]">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              : profile.username[0].toUpperCase()
            }
          </div>
          <div className="flex gap-6">
            <Stat label="Videos" value={videos.length} />
            <Stat label="Followers" value={profile.follower_count} />
            <Stat label="Following" value={profile.following_count} />
          </div>
        </div>

        {profile.display_name && <p className="font-semibold">{profile.display_name}</p>}
        {profile.bio && <p className="text-sm text-[#888] mt-1">{profile.bio}</p>}

        <div className="flex gap-3 mt-4">
          <Link href="/profile/edit" className="flex-1 text-center border border-[#333] rounded-xl py-2 text-sm font-medium hover:border-[#00C853] transition-colors">
            Edit Profile
          </Link>
          <Link href="/earnings" className="flex-1 text-center bg-[#00C853]/10 border border-[#00C853]/30 rounded-xl py-2 text-sm font-medium text-[#00C853]">
            💰 Earnings
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#222]">
        {([['videos', Grid3X3], ['liked', Heart], ['saved', Bookmark]] as [Tab, React.ElementType][]).map(([t, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${
              tab === t ? 'border-[#00C853] text-[#00C853]' : 'border-transparent text-[#555]'
            }`}
          >
            <Icon size={20} />
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {videos.map(video => (
          <div key={video.id} className="relative aspect-[9/16] bg-[#111] overflow-hidden">
            {video.thumbnail_url
              ? <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A] text-2xl">🎬</div>
            }
            <div className="absolute bottom-1 left-1 text-xs text-white font-semibold drop-shadow">
              ▶ {formatCount(video.view_count)}
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-16 text-[#555]">
          <p className="text-3xl mb-2">🎬</p>
          <p>{tab === 'videos' ? 'No videos yet' : tab === 'liked' ? 'No liked videos' : 'No saved videos'}</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="font-bold text-lg">{formatCount(value)}</p>
      <p className="text-xs text-[#888]">{label}</p>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
