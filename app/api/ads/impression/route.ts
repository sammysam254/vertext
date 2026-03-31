import { NextRequest, NextResponse } from 'next/server';
import { recordAdImpression } from '@/lib/earnings';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoId, creatorId, adNetwork, adType, platformRevenueKes } = body;

    if (!videoId || !creatorId || !adNetwork || !adType || platformRevenueKes === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await recordAdImpression({ videoId, creatorId, adNetwork, adType, platformRevenueKes });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
