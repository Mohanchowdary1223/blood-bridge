"use server"

import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    const { userId, password, bloodType, dob, gender, weight, height, country, state, city } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Check eligibility
    if (!user.canUpdateToDonor) {
      return NextResponse.json({ error: 'You are not eligible to update to donor.' }, { status: 403 });
    }
    if (user.profileUpdatableAt) {
      const now = new Date();
      if (now < new Date(user.profileUpdatableAt)) {
        return NextResponse.json({ error: `You can update to donor after ${user.profileUpdatableAt.toDateString()}` }, { status: 403 });
      }
    }
    // If user is eligible, update donor fields
    if (!bloodType || !dob || !gender || !weight || !height || !country || !state || !city) {
      return NextResponse.json({ error: 'All donor fields are required' }, { status: 400 });
    }

    // Validate inputs
    if (weight < 0 || height < 0) {
      return NextResponse.json({ error: 'Invalid weight or height values' }, { status: 400 });
    }

    // Only update password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Update other fields
    Object.assign(user, {
      role: 'donor',
      bloodType,
      dob,
      gender,
      weight,
      height,
      country,
      state,
      city,
      canUpdateToDonor: true,
      profileUpdatableAt: null
    });

    await user.save();

    // Return user without sensitive data
    const { password: _, ...safeUser } = user.toObject();
    return NextResponse.json({ user: safeUser }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
  }
}