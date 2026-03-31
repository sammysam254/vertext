'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

type Period = 'daily' | 'weekly' | 'monthly';

interface ChartData {
  label: string;
  earned: number;
  revenue: number;
}

export function EarningsChart({ userId }: { userId: string }) {
  const [period, setPeriod] = useState<Period>('daily');
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    loadChartData();
  }, [period, userId]);

  async function loadChartData() {
    const days = period === 'daily' ? 30 : period === 'weekly' ? 84 : 365;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const { data: impressions } = await supabase
      .from('ad_impressions')
      .select('created_at, revenue_kes, creator_share_kes')
      .eq('creator_id', userId)
      .gte('created_at', since)
      .order('created_at');

    if (!impressions) return;

    const grouped: Record<string, { earned: number; revenue: number }> = {};

    impressions.forEach(imp => {
      const date = new Date(imp.created_at);
      let key: string;
      if (period === 'daily') {
        key = date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
      } else {
        key = date.toLocaleDateString('en-KE', { month: 'short', year: '2-digit' });
      }
      if (!grouped[key]) grouped[key] = { earned: 0, revenue: 0 };
      grouped[key].earned += Number(imp.creator_share_kes);
      grouped[key].revenue += Number(imp.revenue_kes);
    });

    setData(Object.entries(grouped).map(([label, vals]) => ({ label, ...vals })));
  }

  return (
    <div className="bg-[#111] rounded-2xl p-4 border border-[#222]">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-sm">Earnings Chart</span>
        <div className="flex gap-1">
          {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                period === p ? 'bg-[#00C853] text-black' : 'bg-[#1A1A1A] text-[#888]'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data}>
            <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 8 }}
              labelStyle={{ color: '#888', fontSize: 11 }}
              itemStyle={{ color: '#00C853', fontSize: 11 }}
              formatter={(val: number) => [`KES ${val.toFixed(2)}`, 'Earned']}
            />
            <Line
              type="monotone"
              dataKey="earned"
              stroke="#00C853"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#00C853' }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-40 flex items-center justify-center text-[#555] text-sm">
          No earnings data yet
        </div>
      )}
    </div>
  );
}
