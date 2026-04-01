'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Film } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) { setError('Please select a video file'); return; }
    if (f.size > 200 * 1024 * 1024) { setError('Video must be under 200MB'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  }

  async function handleUpload() {
    if (!file || !user) return;
    setUploading(true);
    setProgress(10);
    setError('');

    try {
      // Log for debugging
      console.log('Starting upload for user:', user.id);
      console.log('File details:', { name: file.name, type: file.type, size: file.size });

      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      console.log('Uploading to path:', path);

      // Try to upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(path, file, { 
          contentType: file.type,
          upsert: false 
        });

      if (uploadError) {
        console.error('Upload error details:', {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError
        });
        
        // Provide specific error messages
        if (uploadError.message?.toLowerCase().includes('bucket')) {
          throw new Error('Video storage is not set up. Please create the "videos" bucket in Supabase Storage and make it public.');
        } else if (uploadError.message?.toLowerCase().includes('policy')) {
          throw new Error('Permission denied. Please check storage policies in Supabase.');
        } else if (uploadError.message?.toLowerCase().includes('size')) {
          throw new Error('Video file is too large. Maximum size is 200MB.');
        }
        
        throw new Error(uploadError.message || 'Failed to upload video');
      }

      console.log('Upload successful:', uploadData);
      setProgress(70);

      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(path);
      console.log('Public URL:', publicUrl);

      const tags = hashtags.split(/[\s,#]+/).filter(Boolean).map(t => t.toLowerCase());

      const { error: dbError } = await supabase.from('videos').insert({
        user_id: user.id,
        description,
        video_url: publicUrl,
        hashtags: tags,
        is_public: isPublic,
        allow_comments: allowComments,
      });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(dbError.message || 'Failed to save video');
      }

      console.log('Video saved to database');
      setProgress(100);
      setTimeout(() => router.push('/'), 500);
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  if (!user) {
    return (
      <div className="h-dvh flex items-center justify-center text-center px-8">
        <div>
          <p className="text-[#888] mb-4">Sign in to upload videos</p>
          <button onClick={() => router.push('/login')} className="bg-[#00C853] text-black px-6 py-2 rounded-full font-semibold">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-y-auto scrollbar-hide bg-[#0A0A0A] pb-20">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Upload Video
        </h1>

        {/* File picker */}
        {!file ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-[9/16] max-h-64 bg-[#111] border-2 border-dashed border-[#333] rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#00C853] transition-colors"
          >
            <Film size={40} className="text-[#555]" />
            <p className="text-[#888]">Tap to select video</p>
            <p className="text-xs text-[#555]">MP4, MOV up to 200MB</p>
          </button>
        ) : (
          <div className="relative w-full aspect-[9/16] max-h-64 rounded-2xl overflow-hidden bg-black">
            <video src={preview!} className="w-full h-full object-cover" controls />
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        )}

        <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />

        {/* Form */}
        <div className="mt-6 space-y-4">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your video..."
            rows={3}
            className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#00C853] resize-none text-sm"
          />

          <input
            value={hashtags}
            onChange={e => setHashtags(e.target.value)}
            placeholder="#hashtags #separated #by #spaces"
            className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#00C853] text-sm"
          />

          {/* Toggles */}
          <div className="space-y-3">
            <Toggle label="Public video" value={isPublic} onChange={setIsPublic} />
            <Toggle label="Allow comments" value={allowComments} onChange={setAllowComments} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {uploading && (
            <div className="w-full bg-[#222] rounded-full h-2">
              <div
                className="bg-[#00C853] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-[#00C853] text-black font-semibold py-3 rounded-xl hover:bg-[#00E676] transition-colors disabled:opacity-50"
          >
            {uploading ? `Uploading ${progress}%...` : 'Post Video'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#888]">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-[#00C853]' : 'bg-[#333]'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
