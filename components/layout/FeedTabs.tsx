'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function FeedTabs() {
  const pathname = usePathname();

  return (
    <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-center gap-6 pt-safe pt-4 pb-2">
      <Link
        href="/"
        className={`text-sm font-semibold pb-1 transition-colors ${
          pathname === '/'
            ? 'text-white border-b-2 border-[#00C853]'
            : 'text-white/50'
        }`}
      >
        For You
      </Link>
      <Link
        href="/following"
        className={`text-sm font-semibold pb-1 transition-colors ${
          pathname === '/following'
            ? 'text-white border-b-2 border-[#00C853]'
            : 'text-white/50'
        }`}
      >
        Following
      </Link>
    </div>
  );
}
