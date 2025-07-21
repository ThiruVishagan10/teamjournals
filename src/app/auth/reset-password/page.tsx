'use client';

import { useState } from 'react';
import { resetPassword } from '@/utils/supabase/actions';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      await resetPassword(email);
      setStatus('✅ Check your email for the reset link.');
    } catch (err: any) {
      setStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white shadow p-6 rounded space-y-4"
      >
        <h1 className="text-xl font-semibold">Reset Password</h1>

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="input input-bordered w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className={`btn w-full ${loading ? 'btn-disabled bg-gray-400 cursor-not-allowed' : 'btn-primary'}`}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {status && <p className="text-sm text-gray-600 mt-2">{status}</p>}
      </form>
    </div>
  );
}