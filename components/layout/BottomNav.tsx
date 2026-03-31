'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, DollarSign, User } from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Search, label: 'Explore' },
  { href: '/upload', icon: Plus, label: 'Upload', special: true },
  { href: '/earnings', icon: DollarSign, label: 'Earnings' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-[#222]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ href, icon: Icon, label, special }) => {
          const isActive = pathname === href;
          if (special) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center">
                <div className="w-10 h-10 bg-[#00C853] rounded-xl flex items-center justify-center shadow-lg shadow-[#00C853]/30 -mt-2">
                  <Icon size={22} className="text-black" strokeWidth={2.5} />
                </div>
              </Link>
            );
          }
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 py-1 px-3">
              <Icon
                size={22}
                className={isActive ? 'text-[#00C853]' : 'text-[#888]'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] ${isActive ? 'text-[#00C853]' : 'text-[#888]'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
