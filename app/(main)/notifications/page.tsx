'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/lib/types';
import { Heart, MessageCircle, UserPlus, AtSign, TrendingUp } from 'lucide-react';

const ICONS = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
  earning_milestone: TrendingUp,
};

const COLORS = {
  like: 'text-[#00C853]',
  comment: 'text-blue-400',
  follow: 'text-purple-400',
  mention: 'text-yellow-400',
  earning_milestone: 'text-[#FFD700]',
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    markAllRead();
  }, [user]);

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*, actor:actor_id(username, avatar_url)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(data ?? []);
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user!.id).eq('is_read', false);
  }

  if (!user) {
    return (
      <div className="h-dvh flex items-center justify-center text-[#888]">
        Sign in to see notifications
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-y-auto scrollbar-hide bg-[#0A0A0A] pb-20">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Notifications
        </h1>

        {notifications.length === 0 ? (
          <div className="text-center py-16 text-[#555]">
            <p className="text-3xl mb-2">🔔</p>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map(notif => {
              const Icon = ICONS[notif.type] ?? Heart;
              const color = COLORS[notif.type] ?? 'text-[#888]';
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    !notif.is_read ? 'bg-[#111]' : 'bg-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {notif.actor && (
                      <span className="text-sm font-semibold text-[#00C853]">@{(notif.actor as { username: string }).username} </span>
                    )}
                    <span className="text-sm text-white">{notif.message}</span>
                    <p className="text-xs text-[#555] mt-0.5">{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 bg-[#00C853] rounded-full shrink-0 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
