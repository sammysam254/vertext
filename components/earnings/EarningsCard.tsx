'use client';
import { useEffect, useState, useRef } from 'react';
import { TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Earnings } from '@/lib/types';
import { CREATOR_SHARE_RATE } from '@/lib/earnings';
import { WithdrawModal } from './WithdrawModal';

interface EarningsCardProps {
  userId: string;
}

export function EarningsCard({ userId }: EarningsCardProps) {
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [toast, setToast] = useState('');
  const prevBalance = useRef<number>(0);

  useEffect(() => {
    fetchEarnings();

    // Realtime subscription
    const channel = supabase
      .channel('earnings-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'earnings', filter: `user_id=eq.${userId}` },
        (payload) => {
          const newData = payload.new as Earnings;
          const diff = newData.available_balance_kes - prevBalance.current;
          if (diff > 0) {
            showToast(`+KES ${diff.toFixed(2)} earned! 💚`);
          }
          prevBalance.current = newData.available_balance_kes;
          setEarnings(newData);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function fetchEarnings() {
    const { data } = await supabase.from('earnings').select('*').eq('user_id', userId).single();
    if (data) {
      setEarnings(data);
      prevBalance.current = data.available_balance_kes;
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const totalEarned = earnings?.total_earned_kes ?? 0;
  const available = earnings?.available_balance_kes ?? 0;
  const nextMilestone = [100, 500, 1000, 5000, 10000].find(m => m > totalEarned) ?? 10000;
  const prevMilestone = [0, 100, 500, 1000, 5000].find((_, i, arr) => arr[i + 1] > totalEarned) ?? 0;
  const milestoneProgress = (totalEarned - prevMilestone) / (nextMilestone - prevMilestone);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#00C853] text-black px-4 py-2 rounded-full text-sm font-semibold animate-count-up">
          {toast}
        </div>
      )}

      <div className="space-y-3">
        {/* Main stats */}
        <div className="bg-[#111] rounded-2xl p-4 border border-[#222]">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={18} className="text-[#FFD700]" />
            <span className="font-semibold">Your Earnings</span>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-3 mb-4">
            <p className="text-xs text-[#888] mb-1">Total Earned</p>
            <p className="text-2xl font-bold text-[#FFD700] font-mono-earnings">
              KES {totalEarned.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Available balance + withdraw */}
          <div className="flex items-center justify-between bg-[#00C853]/10 border border-[#00C853]/30 rounded-xl p-3">
            <div>
              <p className="text-xs text-[#888]">Available to Withdraw</p>
              <p className="text-lg font-bold text-[#00C853] font-mono-earnings">
                KES {available.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={available < 50}
              className="flex items-center gap-1 bg-[#00C853] text-black px-4 py-2 rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-[#00E676] transition-colors"
            >
              Withdraw <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Milestone progress */}
        <div className="bg-[#111] rounded-2xl p-4 border border-[#222]">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-[#00C853]" />
            <span className="text-sm font-semibold">Next milestone: KES {nextMilestone.toLocaleString()}</span>
          </div>
          <div className="w-full bg-[#222] rounded-full h-2 mb-2">
            <div
              className="bg-[#00C853] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(milestoneProgress * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#555]">
            <span>KES {totalEarned.toFixed(0)}</span>
            <span>KES {nextMilestone.toLocaleString()}</span>
          </div>
          <p className="text-xs text-[#888] mt-2">
            Keep creating great content to reach your next milestone! 🎯
          </p>
        </div>

        {/* How it works */}
        <details className="bg-[#111] rounded-2xl border border-[#222]">
          <summary className="px-4 py-3 text-sm font-semibold cursor-pointer text-[#888] hover:text-white transition-colors">
            💡 How earnings work
          </summary>
          <div className="px-4 pb-4 text-sm text-[#888] space-y-2">
            <p>You earn money when people watch your videos and interact with ads.</p>
            <div className="bg-[#1A1A1A] rounded-xl p-3 space-y-1 text-xs">
              <p>✓ More views = More earnings</p>
              <p>✓ Longer watch time = Higher rewards</p>
              <p>✓ Engaging content = Better performance</p>
            </div>
            <p className="text-xs">Minimum withdrawal: KES 50</p>
          </div>
        </details>
      </div>

      {showWithdraw && (
        <WithdrawModal
          available={available}
          userId={userId}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => { fetchEarnings(); showToast('Withdrawal initiated! 🎉'); }}
        />
      )}
    </>
  );
}
