import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import User from '@/models/User';
import { connectToDatabase } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function isAuthenticated(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { isAuth: false, error: 'No token found' };
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };
    await connectToDatabase();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return { isAuth: false, error: 'User not found' };
    }

    return { isAuth: true, user };
  } catch (error) {
    return { isAuth: false, error: 'Invalid token' };
  }
}

export async function isAdmin(request: Request) {
  const authResult = await isAuthenticated(request);

  if (!authResult.isAuth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!authResult.user.isAdmin()) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  return { isAdmin: true, user: authResult.user };
}

export async function requireAdmin(handler: Function) {
  return async (request: Request) => {
    const adminCheck = await isAdmin(request);
    
    if ('error' in adminCheck) {
      return adminCheck;
    }
    
    return handler(request, adminCheck.user);
  };
} 