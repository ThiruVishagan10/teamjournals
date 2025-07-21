'use server';

import { createClient } from '../supabase/server';
import { redirect } from 'next/navigation';
import type { Provider } from '@supabase/supabase-js';

const signInWith = (provider: Provider) => {
  return async () => {
    const supabase = await createClient();
    const site_url = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
    const auth_callback_url = `${site_url}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { 
        redirectTo: auth_callback_url 
      },
    });
    
    if (error) throw error;
    if (!data?.url) throw new Error('No redirect URL received');
    
    redirect(data.url);
  };
};



export const signinWithGoogle = signInWith('google');




export async function emailSignup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const display_name = formData.get('display_name') as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name },
    },
  });

  console.log('Signup data:', data);

  if (error) {
    console.error('Supabase signup error:', error);
    throw new Error(error.message);
  }

  return { success: true }; // ✅ let client handle redirect
}

export async function emailSignin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ Signin error:', error.message);
    throw new Error(error.message); // This will show up in dev overlay
  }

  if (!data.user?.email_confirmed_at) {
    redirect('/auth?error=confirm_email');
  }

  redirect('/');
}


export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth');
}

export async function resetPassword(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}