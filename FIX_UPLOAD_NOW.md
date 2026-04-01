# Fix "Failed to Fetch" Upload Error - DO THIS NOW!

## The Problem
The "failed to fetch" error when uploading videos means the Supabase storage bucket "videos" either:
1. Doesn't exist
2. Isn't public
3. Has wrong permissions

## Quick Fix (2 minutes)

### Step 1: Open test-storage.html
1. Open the file `test-storage.html` in your browser
2. Click "List All Buckets" button
3. Check if you see a bucket named "videos"

### Step 2: If bucket doesn't exist - CREATE IT

**Option A: Via Supabase Dashboard (EASIEST)**
1. Go to https://supabase.com/dashboard
2. Select your project (dkffujuqrhojgzpslmok)
3. Click **Storage** in left sidebar
4. Click **"New bucket"** button
5. Enter:
   - Name: `videos`
   - ✅ Check "Public bucket"
   - File size limit: `209715200` (200MB)
6. Click **"Create bucket"**
7. DONE! Try uploading again.

**Option B: Via SQL**
1. Go to Supabase Dashboard → SQL Editor
2. Paste this and click RUN:

```sql
-- Create videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('videos', 'videos', true, 209715200)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Add policies
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

CREATE POLICY IF NOT EXISTS "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

CREATE POLICY IF NOT EXISTS "Allow users to update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Step 3: Verify It Works
1. Refresh your app
2. Try uploading a video
3. Check browser console (F12) for any errors
4. If you see detailed error messages, they'll tell you exactly what's wrong

## Still Not Working?

### Check These:

1. **Is the bucket PUBLIC?**
   - Go to Storage → videos bucket → Settings
   - Make sure "Public bucket" is enabled

2. **Are you logged in?**
   - You must be signed in to upload
   - Check if you see your profile in the app

3. **Is the file too large?**
   - Maximum is 200MB
   - Try a smaller video file

4. **Check browser console**
   - Press F12
   - Go to Console tab
   - Look for red error messages
   - They will tell you the exact problem

## What the Console Should Show

When upload works, you'll see:
```
Starting upload for user: [your-user-id]
File details: {name: "video.mp4", type: "video/mp4", size: 12345678}
Uploading to path: [user-id]/[timestamp].mp4
Upload successful: {path: "..."}
Public URL: https://...
Video saved to database
```

When it fails, you'll see:
```
Upload error details: {message: "Bucket not found", ...}
```

## After Creating Bucket

The upload should work immediately. No need to:
- Restart the server
- Clear cache
- Redeploy

Just refresh the page and try uploading again!

## Test File

Use `test-storage.html` to verify your bucket exists before trying to upload in the app.
