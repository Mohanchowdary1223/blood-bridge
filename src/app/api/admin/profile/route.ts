"use server"

import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    await connectMongo();
    
    // Get token from cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId: string; role: string };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!decoded.userId || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'User not found or not admin' }, { status: 404 });
    }

    // Return user data without sensitive information
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error('Admin profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin profile' }, { status: 500 });
  }
} 