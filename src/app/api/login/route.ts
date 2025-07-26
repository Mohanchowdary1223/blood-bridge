"use server"

import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_CONFIG: SignOptions = { expiresIn: '7d' };
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
};

export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      JWT_CONFIG
    );

    // Create response with user data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      signupReason: user.signupReason || '',
      bloodType: user.bloodType || ''
    };

    const response = NextResponse.json(
      { user: userData },
      { status: 200 }
    );

    // Set HTTP-only cookie with the token
    response.cookies.set('token', token, COOKIE_CONFIG);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}