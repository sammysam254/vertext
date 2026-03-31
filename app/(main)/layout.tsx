import { AuthProvider } from '@/context/AuthContext';
import { BottomNav } from '@/components/layout/BottomNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="relative h-dvh bg-[#0A0A0A]">
        {children}
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
