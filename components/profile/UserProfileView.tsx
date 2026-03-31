'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Profile, Video } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserProfileViewProps {
  profile: Profile;
  videos: Video[];
}

export function UserProfileView({ profile, videos }: UserProfileViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile.follower_count);

  async function toggleFollow() {
    if (!user) { router.push('/login'); return; }
    if (following) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profile.id);
      setFollowing(false);
      setFollowerCount(c => c - 1);
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id });
      setFollowing(true);
      setFollowerCount(c => c + 1);
    }
  }

  return (
    <div className="h-dvh overflow-y-auto scrollbar-hide bg-[#0A0A0A] pb-20">
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="font-bold">@{profile.username}</h1>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-[#222] border-2 border-[#00C853] overflow-hidden flex items-center justify-center text-2xl font-bold text-[#00C853]">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              : profile.username[0].toUpperCase()
            }
          </div>
          <div className="flex gap-6">
            <div className="text-center"><p className="font-bold">{videos.length}</p><p className="text-xs text-[#888]">Videos</p></div>
            <div className="text-center"><p className="font-bold">{followerCount}</p><p className="text-xs text-[#888]">Followers</p></div>
            <div className="text-center"><p className="font-bold">{profile.following_count}</p><p className="text-xs text-[#888]">Following</p></div>
          </div>
        </div>

        {profile.display_name && <p className="font-semibold">{profile.display_name}</p>}
        {profile.bio && <p className="text-sm text-[#888] mt-1">{profile.bio}</p>}

        {user?.id !== profile.id && (
          <button
            onClick={toggleFollow}
            className={`mt-4 w-full py-2 rounded-xl font-semibold text-sm transition-colors ${
              following
                ? 'border border-[#333] text-white'
                : 'bg-[#00C853] text-black hover:bg-[#00E676]'
            }`}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-0.5">
        {videos.map(video => (
          <div key={video.id} className="relative aspect-[9/16] bg-[#111] overflow-hidden">
            {video.thumbnail_url
              ? <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A] text-2xl">🎬</div>
            }
          </div>
        ))}
      </div>
    </div>
  );
}
