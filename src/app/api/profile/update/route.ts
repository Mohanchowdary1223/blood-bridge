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
    if (!password || !bloodType || !dob || !gender || !weight || !height || !country || !state || !city) {
      return NextResponse.json({ error: 'All donor fields are required' }, { status: 400 });
    }
    const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;
    user.password = hashedPassword;
    user.role = 'donor';
    user.bloodType = bloodType;
    user.dob = dob;
    user.gender = gender;
    user.weight = weight;
    user.height = height;
    user.country = country;
    user.state = state;
    user.city = city;
    user.canUpdateToDonor = true;
    user.profileUpdatableAt = null;
    await user.save();
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
  }
} 