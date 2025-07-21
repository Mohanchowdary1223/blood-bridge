import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/middleware';

async function handler(request: Request) {
  await connectToDatabase();

  if (request.method === 'GET') {
    try {
      const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
      return NextResponse.json(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export const GET = requireAdmin(handler); 