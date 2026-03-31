'use client';
import { useAuth } from '@/context/AuthContext';
import { EarningsCard } from '@/components/earnings/EarningsCard';
import { EarningsChart } from '@/components/earnings/EarningsChart';
import { RecentTransactions } from '@/components/earnings/RecentTransactions';
import Link from 'next/link';

export default function EarningsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-dvh flex items-center justify-center text-center px-8">
        <div>
          <p className="text-4xl mb-3">💰</p>
          <p className="text-lg font-semibold mb-2">Start earning on Vertex</p>
          <p className="text-[#888] text-sm mb-6">Sign in to track your creator earnings</p>
          <Link href="/login" className="bg-[#00C853] text-black px-8 py-3 rounded-xl font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-y-auto scrollbar-hide bg-[#0A0A0A] pb-20">
      <div className="px-4 pt-12 pb-4 space-y-4">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          💰 Earnings
        </h1>
        <EarningsCard userId={user.id} />
        <EarningsChart userId={user.id} />
        <RecentTransactions userId={user.id} />
      </div>
    </div>
  );
}
