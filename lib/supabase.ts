import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkffujuqrhojgzpslmok.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmZ1anVxcmhvamd6cHNsbW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzU3NzUsImV4cCI6MjA5MDU1MTc3NX0.TUE6LZqp2bv1Xv4AjIeNmEjcUbnbJJPgQvouIDYPw_M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  },
  db: {
    schema: 'public',
  },
});
