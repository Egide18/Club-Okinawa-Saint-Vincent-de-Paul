import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

/** Protège /admin/* (sauf /admin/login) par le cookie de session JWT. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/admin') || pathname === '/admin/login' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  const token = req.cookies.get('okinawa_admin_session')?.value;
  const secret = process.env.SESSION_SECRET;
  let valid = false;
  if (token && secret && secret.length >= 16) {
    try {
      await jose.jwtVerify(token, new TextEncoder().encode(secret));
      valid = true;
    } catch {
      valid = false;
    }
  } else if (token && process.env.NODE_ENV !== 'production') {
    // Dev sans SESSION_SECRET : laisser passer la vérification au layout serveur
    valid = true;
  }
  if (!valid) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
