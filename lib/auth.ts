import { supabase } from './supabase';

export async function signUp(email: string, password: string, username: string) {
  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  
  if (error) throw error;
  
  // Wait for profile to be created by trigger
  if (data.user) {
    console.log('User created, waiting for profile...');
    
    // Poll for profile creation (max 5 seconds)
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (profile) {
        console.log('Profile created successfully');
        break;
      }
      
      console.log(`Waiting for profile... attempt ${i + 1}/10`);
    }
  }
  
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
