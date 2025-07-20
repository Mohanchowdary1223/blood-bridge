"use server"

import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import User from '@/models/User';

function calculateAge(dateOfBirth: string) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    const body = await req.json();
    const { userId, name, phone, signupReason, dateOfBirth, currentAge, role, isAvailable } = body;

    if (!userId || !name || !phone || !signupReason || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let finalSignupReason = signupReason;
    let calculatedAge = currentAge;

    // If date of birth is provided, calculate age and determine appropriate signup reason
    if (dateOfBirth) {
      calculatedAge = calculateAge(dateOfBirth);
      
      // Determine the specific age-based reason
      if (calculatedAge < 18) {
        finalSignupReason = 'underAge';
      } else if (calculatedAge > 65) {
        finalSignupReason = 'aboveAge';
      } else {
        finalSignupReason = 'donateLater';
      }
    }

    const updateData: Record<string, unknown> = {
      name,
      phone,
      signupReason: finalSignupReason,
      role
      , ...(isAvailable !== undefined ? { isAvailable } : {})
    };

    if (dateOfBirth) {
      updateData.dateOfBirth = dateOfBirth;
      updateData.currentAge = calculatedAge;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User update failed' }, { status: 500 });
    }

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Profile edit failed' }, { status: 500 });
  }
} 