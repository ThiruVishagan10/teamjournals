// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const url = request.nextUrl;
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const provider = searchParams.get('provider');

  const publicPaths = [
    '/auth',
    '/auth/reset-password',
    '/auth/update-password',
    '/auth/callback',
  ];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  // ✅ Force session cookie hydration if Supabase returned ?code=
  if (code) {
    await supabase.auth.getSession();
  }

  // ✅ Only redirect to update-password on password recovery flows (not OAuth login)
  if (code && type === 'recovery') {
    const redirectUrl = new URL('/auth/update-password', url.origin);
    return NextResponse.redirect(redirectUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Allow ?code= pages to resolve fully before checking user
  const isOAuthRedirect = code && !type;
  if (!user && !isPublic && !isOAuthRedirect) {
    const redirectUrl = new URL('/auth', url.origin);
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}