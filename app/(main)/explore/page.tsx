'use client';
import { useState, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Video } from '@/lib/types';
import Link from 'next/link';

const CATEGORIES = ['All', 'Comedy', 'Education', 'Food', 'Music', 'Sports', 'Travel', 'Tech'];

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [videos, setVideos] = useState<Video[]>([]);
  const [trending, setTrending] = useState<string[]>([]);

  useEffect(() => {
    loadTrending();
    loadVideos();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadVideos(), 300);
    return () => clearTimeout(timer);
  }, [query, category]);

  async function loadTrending() {
    const { data } = await supabase
      .from('videos')
      .select('hashtags')
      .not('hashtags', 'is', null)
      .limit(50);
    const counts: Record<string, number> = {};
    data?.forEach(v => v.hashtags?.forEach((h: string) => { counts[h] = (counts[h] ?? 0) + 1; }));
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([h]) => h);
    setTrending(sorted);
  }

  async function loadVideos() {
    let q = supabase.from('videos').select('*, profiles(*)').eq('is_public', true);
    if (query) q = q.ilike('description', `%${query}%`);
    if (category !== 'All') q = q.contains('hashtags', [category.toLowerCase()]);
    const { data } = await q.order('view_count', { ascending: false }).limit(20);
    setVideos(data ?? []);
  }

  return (
    <div className="h-dvh overflow-y-auto scrollbar-hide bg-[#0A0A0A] pb-20">
      {/* Search bar */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/90 backdrop-blur-md px-4 pt-12 pb-3">
        <div className="flex items-center gap-3 bg-[#111] rounded-xl px-4 py-3">
          <Search size={18} className="text-[#555]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search videos, users, hashtags..."
            className="flex-1 bg-transparent text-white placeholder-[#555] focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-[#00C853] text-black'
                : 'bg-[#111] text-[#888] border border-[#222]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trending hashtags */}
      {!query && trending.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-[#00C853]" />
            <span className="text-sm font-semibold text-[#888]">Trending</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trending.map(tag => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="bg-[#111] border border-[#222] px-3 py-1 rounded-full text-sm text-[#00C853]"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video grid */}
      <div className="grid grid-cols-3 gap-0.5 px-0.5">
        {videos.map(video => (
          <Link key={video.id} href={`/?v=${video.id}`} className="relative aspect-[9/16] bg-[#111] overflow-hidden">
            {video.thumbnail_url ? (
              <img src={video.thumbnail_url} alt={video.title ?? ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
                <span className="text-2xl">🎬</span>
              </div>
            )}
            <div className="absolute bottom-1 left-1 text-xs text-white font-semibold drop-shadow">
              {formatCount(video.view_count)}
            </div>
          </Link>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-16 text-[#555]">
          <p className="text-3xl mb-2">🔍</p>
          <p>No results found</p>
        </div>
      )}
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
