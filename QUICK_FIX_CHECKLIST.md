# Quick Fix Checklist

## Issue 1: Profile Shows "Sign In" After Login

**Status**: ✅ FIXED in code

The auth context now properly waits for the profile to load before showing the sign-in prompt.

## Issue 2: Video Upload "Failed to Fetch"

**Root Cause**: The "videos" storage bucket doesn't exist in your Supabase project.

### Fix Steps (Choose ONE):

#### Option A: Create Bucket via Supabase Dashboard (EASIEST - 2 minutes)

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **"New bucket"** button
5. Fill in:
   - Name: `videos`
   - ✅ Check "Public bucket"
   - File size limit: `209715200` (200MB)
6. Click **"Create bucket"**
7. Done! Try uploading a video now.

#### Option B: Create Bucket via SQL (if you prefer SQL)

1. Go to Supabase Dashboard → SQL Editor
2. Paste and run this:

```sql
-- Create the videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  209715200,
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska']
)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies
CREATE POLICY "Allow authenticated users to upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow public to view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

CREATE POLICY "Allow users to update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Verify It Works

1. After creating the bucket, refresh your app
2. Try uploading a video
3. Check browser console (F12) for detailed error messages if it still fails
4. The error message will now tell you exactly what's wrong

### Common Issues

**"Bucket not found"**
- The bucket doesn't exist → Follow Option A or B above

**"Permission denied"**
- The bucket exists but isn't public → Go to Storage → videos bucket → Settings → Make it public

**"Policy violation"**
- Storage policies aren't set → Run the SQL from Option B

**"File too large"**
- Video is over 200MB → Compress the video or increase the limit in bucket settings

## Test After Fixing

1. ✅ Create a new account → Should work without "failed to save"
2. ✅ Login → Profile page should show your profile, not "Sign In"
3. ✅ Upload a video → Should upload successfully
4. ✅ Like a video → Should update like count
5. ✅ Comment on a video → Should post comment
6. ✅ Share a video → Should copy link or open share dialog

## Still Having Issues?

Check the browser console (F12 → Console tab) for detailed error messages. The upload function now logs:
- User ID
- File details (name, type, size)
- Upload path
- Specific error messages

Share those console logs if you need more help!
