# Storage Bucket Setup Guide

## Quick Fix: Create the Videos Bucket

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `videos`
   - **Public bucket**: ✅ Enable (check the box)
   - **File size limit**: 200 MB (or 209715200 bytes)
   - **Allowed MIME types**: Leave empty or add: `video/mp4, video/quicktime, video/webm`
5. Click **"Create bucket"**

### Option 2: Using SQL Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  209715200,
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for videos bucket
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

## Verify Setup

After creating the bucket, verify it works:

1. Go to **Storage** → **videos** bucket
2. You should see an empty bucket
3. Try uploading a test video through your app
4. The video should appear in the bucket under a folder named with the user's UUID

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket name is exactly `videos` (lowercase)
- Ensure the bucket is marked as **public**
- Check that your Supabase URL and anon key in `.env.local` are correct

### "Permission denied" error
- Make sure you're logged in when uploading
- Verify the storage policies are created (run the SQL above)
- Check that RLS (Row Level Security) is enabled on storage.objects

### Videos not playing
- Ensure the bucket is **public**
- Check that the video URL is accessible in a browser
- Verify CORS settings in Supabase (usually automatic for public buckets)

## Storage Policies Explained

- **INSERT**: Authenticated users can upload videos to their own folder
- **SELECT**: Anyone (public) can view/download videos
- **UPDATE**: Users can only update videos in their own folder
- **DELETE**: Users can only delete videos in their own folder

The folder structure is: `videos/{user_id}/{timestamp}.{extension}`
