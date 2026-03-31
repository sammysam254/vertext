import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { UserProfileView } from '@/components/profile/UserProfileView';

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) notFound();

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  return <UserProfileView profile={profile} videos={videos ?? []} />;
}
