import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/middleware';

async function handler(
  request: Request,
  { params }: { params: { userId: string } }
) {
  await connectToDatabase();
  const { userId } = params;

  if (request.method === 'GET') {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'PUT') {
    try {
      const data = await request.json();
      const user = await User.findById(userId);

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Prevent changing admin role through this endpoint
      if (user.role === 'admin' || data.role === 'admin') {
        return NextResponse.json(
          { error: 'Cannot modify admin users through this endpoint' },
          { status: 403 }
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: data },
        { new: true }
      ).select('-password');

      return NextResponse.json(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'DELETE') {
    try {
      const user = await User.findById(userId);

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Prevent deleting admin users
      if (user.role === 'admin') {
        return NextResponse.json(
          { error: 'Cannot delete admin users' },
          { status: 403 }
        );
      }

      await User.findByIdAndDelete(userId);
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Failed to delete user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
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
export const PUT = requireAdmin(handler);
export const DELETE = requireAdmin(handler); 