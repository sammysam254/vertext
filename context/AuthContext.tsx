'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, profile: null, loading: true, refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  async function fetchProfile(userId: string, attempt = 0): Promise<boolean> {
    try {
      console.log(`Fetching profile for user ${userId}, attempt ${attempt + 1}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Profile fetch error:', error);
        return false;
      }
      
      if (!data && attempt < 3) {
        // Profile doesn't exist yet, wait and retry
        console.log('Profile not found, retrying in 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchProfile(userId, attempt + 1);
      }
      
      if (data) {
        console.log('Profile loaded successfully:', data);
        setProfile(data);
        return true;
      }
      
      console.error('Profile not found after retries');
      return false;
    } catch (error) {
      console.error('Profile fetch exception:', error);
      return false;
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  useEffect(() => {
    console.log('Initializing auth...');
    
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Session loaded:', session ? 'User logged in' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'User logged in' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          // Wait a bit for trigger to create profile
          await new Promise(resolve => setTimeout(resolve, 500));
          await fetchProfile(session.user.id);
        } else {
          await fetchProfile(session.user.id);
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
