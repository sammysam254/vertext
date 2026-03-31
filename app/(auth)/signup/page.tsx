'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, username);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#00C853]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Vertex
          </h1>
          <p className="text-[#888] mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
            className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#00C853] transition-colors"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#00C853] transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#00C853] transition-colors"
            minLength={6}
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00C853] text-black font-semibold py-3 rounded-xl hover:bg-[#00E676] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[#555] mt-6 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-[#00C853] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
