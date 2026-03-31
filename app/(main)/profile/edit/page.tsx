'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    await supabase.from('profiles').update({ display_name: displayName, bio }).eq('id', profile.id);
    await refreshProfile();
    router.push('/profile');
  }

  return (
    <div className="h-dvh bg-[#0A0A0A] overflow-y-auto scrollbar-hide pb-20">
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-[#222]">
        <button onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="font-bold">Edit Profile</h1>
      </div>
      <div className="px-4 pt-6 space-y-4">
        <div>
          <label className="text-xs text-[#888] mb-1 block">Display Name</label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C853]"
          />
        </div>
        <div>
          <label className="text-xs text-[#888] mb-1 block">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C853] resize-none"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#00C853] text-black font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
