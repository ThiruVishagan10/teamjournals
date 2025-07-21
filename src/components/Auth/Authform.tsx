'use client';

import {
  signinWithGoogle,
  emailSignup,
  emailSignin,
} from '@/utils/supabase/actions';
import React, { useState, useTransition, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');

  useEffect(() => {
    if (successParam === 'confirm_email') {
      alert('✅ Please check your email to confirm your account.');
    }
  }, [successParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    if (!isLogin) formData.append('display_name', displayName);

    startTransition(async () => {
      try {
        setError('');
        if (isLogin) {
          await emailSignin(formData);
        } else {
          await emailSignup(formData);
          router.replace('/auth?success=confirm_email');
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      }
    });
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black px-4">
     <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          {isLogin ? 'Login to Team Journal' : 'Create your account'}
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          {isLogin
            ? 'Enter your credentials to access your account'
            : 'Enter your details to sign up'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium  text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full border-black"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
              {isLogin && (
                <a href="/auth/reset-password" className="float-right text-sm text-blue-500 hover:underline">
                  Forgot password?
                </a>
              )}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Your name"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn- w-full bg-black text-white hover:bg-gray-950"
            disabled={pending}
          >
            {pending ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>

          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </form>

        <div className="my-6 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="px-4 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <button
          onClick={() => signinWithGoogle()}
          className="btn w-full bg-green-500 border hover:bg-gray-100 flex items-center justify-center gap-2"
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
