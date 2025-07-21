import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'default-admin-secret';

export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    const { email, password, name, phone, secretKey } = await req.json();

    // Validate admin secret key
    if (secretKey !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Invalid admin secret key' }, { status: 403 });
    }

    // Check if admin already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role: 'admin'
    });

    return NextResponse.json({ 
      message: 'Admin registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Admin registration error:', error);
    return NextResponse.json({ error: 'Failed to register admin' }, { status: 500 });
  }
} 