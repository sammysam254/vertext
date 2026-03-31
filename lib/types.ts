export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
  total_likes: number;
  is_verified: boolean;
  created_at: string;
}

export interface Video {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  hashtags: string[] | null;
  is_public: boolean;
  allow_comments: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface Comment {
  id: string;
  user_id: string;
  video_id: string;
  parent_id: string | null;
  content: string;
  like_count: number;
  created_at: string;
  profiles?: Profile;
  replies?: Comment[];
}

export interface Earnings {
  id: string;
  user_id: string;
  total_platform_revenue_kes: number;
  total_earned_kes: number;
  available_balance_kes: number;
  total_withdrawn_kes: number;
  lifetime_views: number;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount_kes: number;
  method: 'mpesa' | 'bank';
  phone_number: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  mpesa_transaction_id: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'earning_milestone';
  video_id: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
}

export interface AdImpressionParams {
  videoId: string;
  creatorId: string;
  adNetwork: 'monetag' | 'adsense' | 'propellerads' | 'simulated';
  adType: string;
  platformRevenueKes: number;
}
