import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/register',
  // '/finddonor', // Removed to block admin access
  '/favicon.ico',
  '/_next',
  '/public',
  '/api',
  '/static',
];

const ADMIN_PATH = '/admin';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow /blocked-home for everyone
  if (pathname.startsWith('/blocked-home')) {
    return NextResponse.next();
  }

  // Allow public paths (except for blocked users, handled below)
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  if (!token) {
    // Not authenticated, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // If blocked, only allow /blocked-home, block all other pages (including public)
    if (user.role === 'blocked') {
      if (!pathname.startsWith('/blocked-home')) {
        return NextResponse.redirect(new URL('/blocked-home', request.url));
      } else {
        return NextResponse.next();
      }
    }
    // If admin, only allow /admin and its subpages
    if (user.isAdmin()) {
      if (!pathname.startsWith(ADMIN_PATH)) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }
    // If not admin, block access to /admin and its subpages
    if (pathname.startsWith(ADMIN_PATH)) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    // Authenticated and authorized
    return NextResponse.next();
  } catch {
    // Invalid token
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|public|static).*)',
  ],
}; 