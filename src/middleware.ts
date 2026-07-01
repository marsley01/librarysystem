import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const publicRoutes = ['/', '/login', '/register', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase env vars aren't set, let public routes through
  // and redirect protected routes to /login (where the user will see an error)
  if (!supabaseUrl || !supabaseKey) {
    const path = request.nextUrl.pathname;
    if (publicRoutes.some((route) => path.startsWith(route)) || path === '/') {
      return NextResponse.next({ request });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user role for protected routing only if user exists
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  const isSystemAdmin = profile?.role === 'system_admin';
  const hasProfile = !!profile;

  const path = request.nextUrl.pathname;

  if (publicRoutes.some((route) => path.startsWith(route)) || path === '/') {
    if (user && (path === '/login' || path === '/')) {
      if (!hasProfile) {
        // If they have no profile, they shouldn't be redirected to the dashboard (prevents infinite loop)
        return supabaseResponse;
      }
      if (isSystemAdmin) {
        return NextResponse.redirect(new URL('/system-admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return supabaseResponse;
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in but has no profile, sign them out essentially by redirecting to login with error
  if (!hasProfile) {
    return NextResponse.redirect(new URL('/login?error=Profile+setup+incomplete', request.url));
  }

  // System Admins should only access system-admin routes
  if (isSystemAdmin && !path.startsWith('/system-admin')) {
    return NextResponse.redirect(new URL('/system-admin/dashboard', request.url));
  }

  // Non-system admins cannot access system-admin routes
  if (path.startsWith('/system-admin') && !isSystemAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Only school admins can access /admin routes
  if (path.startsWith('/admin') && profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
