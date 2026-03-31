'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Play, ArrowDownLeft } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'ad' | 'withdrawal';
  label: string;
  amount: number;
  date: string;
  status?: string;
}

export function RecentTransactions({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function load() {
      const [{ data: ads }, { data: withdrawals }] = await Promise.all([
        supabase
          .from('ad_impressions')
          .select('id, creator_share_kes, created_at, video_id')
          .eq('creator_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('withdrawals')
          .select('id, amount_kes, created_at, status, method')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const adTx: Transaction[] = (ads ?? []).map(a => ({
        id: a.id,
        type: 'ad',
        label: 'Ad impression on your video',
        amount: Number(a.creator_share_kes),
        date: a.created_at,
      }));

      const wTx: Transaction[] = (withdrawals ?? []).map(w => ({
        id: w.id,
        type: 'withdrawal',
        label: `Withdrawal via ${w.method === 'mpesa' ? 'M-Pesa' : 'Bank'}`,
        amount: -Number(w.amount_kes),
        date: w.created_at,
        status: w.status,
      }));

      const all = [...adTx, ...wTx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(all.slice(0, 15));
    }
    load();
  }, [userId]);

  if (transactions.length === 0) {
    return (
      <div className="bg-[#111] rounded-2xl p-4 border border-[#222] text-center text-[#555] text-sm py-8">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#222]">
        <span className="font-semibold text-sm">Recent Transactions</span>
      </div>
      <div className="divide-y divide-[#1A1A1A]">
        {transactions.map(tx => (
          <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              tx.type === 'ad' ? 'bg-[#00C853]/10' : 'bg-red-500/10'
            }`}>
              {tx.type === 'ad'
                ? <Play size={14} className="text-[#00C853]" />
                : <ArrowDownLeft size={14} className="text-red-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{tx.label}</p>
              <p className="text-xs text-[#555]">{timeAgo(tx.date)}{tx.status ? ` · ${tx.status}` : ''}</p>
            </div>
            <span className={`text-sm font-semibold font-mono-earnings ${tx.amount >= 0 ? 'text-[#00C853]' : 'text-red-400'}`}>
              {tx.amount >= 0 ? '+' : ''}KES {Math.abs(tx.amount).toFixed(2)}
            </span>
          </div>
        ))}
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
