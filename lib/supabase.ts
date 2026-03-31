import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://dkffujuqrhojgzpslmok.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmZ1anVxcmhvamd6cHNsbW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzU3NzUsImV4cCI6MjA5MDU1MTc3NX0.TUE6LZqp2bv1Xv4AjIeNmEjcUbnbJJPgQvouIDYPw_M'
);
