"use server"

import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    const { userId, name, phone, signupReason, currentAge, bloodType, dateOfBirth, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update basic fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (bloodType !== undefined) user.bloodType = bloodType;
    
    // Handle signup reason change
    if (signupReason !== undefined) {
      user.signupReason = signupReason;
      
      // Update eligibility based on new signup reason
      if (signupReason === 'healthIssue') {
        user.canUpdateToDonor = false;
        user.profileUpdatableAt = null;
      } else if (signupReason === 'ageRestriction') {
        user.canUpdateToDonor = false;
        user.profileUpdatableAt = null;
      } else if (signupReason === 'donateLater') {
        user.canUpdateToDonor = true;
        user.profileUpdatableAt = null;
      }
    }

    // Update age-related fields
    if (currentAge !== undefined) user.currentAge = currentAge;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    

    await user.save();
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Profile edit failed' }, { status: 500 });
  }
} 