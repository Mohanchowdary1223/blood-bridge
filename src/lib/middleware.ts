/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import User from '@/models/User';
import { connectToDatabase } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthResult {
  isAuth: boolean;
  user?: any;
  error?: string;
}

interface AdminResult {
  isAdmin: boolean;
  user?: any;
  error?: string;
}

export async function isAuthenticated(): Promise<AuthResult> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token');
    if (!token?.value) {
      return { isAuth: false, error: 'No token found' };
    }

    const decoded = verify(token.value, JWT_SECRET) as { userId: string };
    if (!decoded?.userId) {
      return { isAuth: false, error: 'Invalid token format' };
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return { isAuth: false, error: 'User not found' };
    }

    return { isAuth: true, user };
  } catch (error) {
    return { isAuth: false, error: error instanceof Error ? error.message : 'Authentication failed' };
  }
}

export async function isAdmin(request: Request): Promise<NextResponse | AdminResult> {
  const authResult = await isAuthenticated();

  if (!authResult.isAuth || !authResult.user) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    );
  }

  if (typeof authResult.user.isAdmin !== 'function' || !authResult.user.isAdmin()) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  return { isAdmin: true, user: authResult.user };
}

export function requireAdmin(handler: (request: Request, user: any) => Promise<NextResponse>) {
  return async (request: Request): Promise<NextResponse> => {
    const adminCheck = await isAdmin(request);
    
    if ('error' in adminCheck || adminCheck instanceof NextResponse) {
      return adminCheck as NextResponse;
    }
    
    return handler(request, adminCheck.user);
  };
}