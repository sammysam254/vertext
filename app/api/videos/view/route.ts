import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { videoId, viewerId, watchDuration, completed } = await req.json();

    if (!videoId) return NextResponse.json({ error: 'videoId required' }, { status: 400 });

    // Increment view count
    await supabase.rpc('increment_view_count', { p_video_id: videoId });

    // Log view record
    await supabase.from('video_views').insert({
      video_id: videoId,
      viewer_id: viewerId ?? null,
      watch_duration: watchDuration ?? 0,
      completed: completed ?? false,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
