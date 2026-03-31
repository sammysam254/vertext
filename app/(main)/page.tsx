import { supabase } from '@/lib/supabase';
import { VideoFeed } from '@/components/video/VideoFeed';
import { FeedTabs } from '@/components/layout/FeedTabs';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { data: videos } = await supabase
    .from('videos')
    .select('*, profiles(*)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="relative h-dvh">
      <FeedTabs />
      <VideoFeed initialVideos={videos ?? []} feedType="foryou" />
    </div>
  );
}
