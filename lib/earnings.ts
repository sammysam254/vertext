import { supabase } from './supabase';
import { AdImpressionParams } from './types';

export const CREATOR_SHARE_RATE = 0.4;
export const PAYOUT_THRESHOLD_KES = 50;
export const MILESTONE_KES = 1000;
export const SIMULATED_REVENUE_PER_VIEW = 0.05;

export async function recordAdImpression({
  videoId,
  creatorId,
  adNetwork,
  adType,
  platformRevenueKes,
}: AdImpressionParams) {
  const creatorShare = platformRevenueKes * CREATOR_SHARE_RATE;

  await supabase.from('ad_impressions').insert({
    video_id: videoId,
    creator_id: creatorId,
    ad_network: adNetwork,
    ad_type: adType,
    revenue_kes: platformRevenueKes,
    creator_share_kes: creatorShare,
  });

  await supabase.rpc('increment_earnings', {
    p_user_id: creatorId,
    p_platform_revenue: platformRevenueKes,
    p_creator_share: creatorShare,
  });

  await checkEarningsMilestone(creatorId);
}

async function checkEarningsMilestone(userId: string) {
  const { data } = await supabase
    .from('earnings')
    .select('total_platform_revenue_kes')
    .eq('user_id', userId)
    .single();

  if (!data) return;

  const milestones = [1000, 5000, 10000, 50000, 100000];
  for (const milestone of milestones) {
    if (data.total_platform_revenue_kes >= milestone) {
      const creatorShare = milestone * CREATOR_SHARE_RATE;
      await supabase.from('notifications').upsert({
        user_id: userId,
        type: 'earning_milestone',
        message: `🎉 Your content generated KES ${milestone.toLocaleString()} for Vertex! You earned KES ${creatorShare.toLocaleString()}.`,
      });
    }
  }
}

export function simulateAdRevenue(videoId: string, creatorId: string) {
  if (process.env.NODE_ENV === 'development') {
    recordAdImpression({
      videoId,
      creatorId,
      adNetwork: 'simulated',
      adType: 'interstitial',
      platformRevenueKes: SIMULATED_REVENUE_PER_VIEW,
    });
  }
}
