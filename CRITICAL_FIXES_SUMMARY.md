# Critical Fixes Summary - Apply These Now!

## Issue: 406 Errors from Supabase

The 406 "Not Acceptable" errors mean Supabase is rejecting API requests due to missing headers or incorrect query methods.

### Fixes Applied:

1. **Updated Supabase Client Configuration** (`lib/supabase.ts`)
   - Added proper headers including `Content-Type` and `Prefer`
   - Configured auth settings for session persistence
   - Added environment variable support

2. **Fixed Query Methods**
   - Changed `.single()` to `.maybeSingle()` for queries that might return no results
   - This prevents 406 errors when a record doesn't exist (like checking if user liked a video)

3. **Files Changed:**
   - `lib/supabase.ts` - Updated client configuration
   - `context/AuthContext.tsx` - Changed profile query to use `.maybeSingle()`
   - `components/video/VideoPlayer.tsx` - Changed likes query to use `.maybeSingle()`

## How to Apply These Fixes:

### Option 1: Pull from Git (if push succeeded)
```bash
cd vertex
git pull origin main
npm install
npm run dev
```

### Option 2: Manual Application (if push failed)

#### 1. Update `lib/supabase.ts`:
```typescript
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
```

#### 2. Update `context/AuthContext.tsx`:
Find the `fetchProfile` function and change `.single()` to `.maybeSingle()`:
```typescript
async function fetchProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();  // Changed from .single()
    
    if (error) {
      console.error('Profile fetch error:', error);
      return;
    }
    setProfile(data);
  } catch (error) {
    console.error('Profile fetch exception:', error);
  }
}
```

#### 3. Update `components/video/VideoPlayer.tsx`:
Find the useEffect that checks if video is liked and change `.single()` to `.maybeSingle()`:
```typescript
useEffect(() => {
  if (!user) return;
  supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', video.id)
    .maybeSingle()  // Changed from .single()
    .then(({ data }) => setLiked(!!data));
}, [user, video.id]);
```

## After Applying Fixes:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Clear browser cache and reload

3. Test:
   - ✅ Profile should load without 406 errors
   - ✅ Like buttons should work
   - ✅ Upload should work (if bucket is created)
   - ✅ Comments should work

## Vercel Deployment:

If the app isn't deploying to Vercel:

1. Go to Vercel Dashboard
2. Find your project
3. Click "Deployments"
4. Click "Redeploy" on the latest deployment
5. Or push an empty commit to trigger deployment:
   ```bash
   git commit --allow-empty -m "trigger deployment"
   git push origin main
   ```

## Storage Bucket Reminder:

Don't forget to create the "videos" bucket in Supabase:
1. Supabase Dashboard → Storage
2. New bucket → Name: "videos"
3. Make it PUBLIC
4. Or run the SQL from `supabase/migrations/004_create_storage_bucket.sql`

## Environment Variables for Vercel:

Make sure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Still Getting Errors?

Check browser console (F12) for specific error messages. The fixes above should resolve:
- ✅ 406 errors on profiles
- ✅ 406 errors on likes
- ✅ Failed to fetch on upload (if bucket exists)
- ✅ Profile loading issues
