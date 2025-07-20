"use server"

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
    const { email, password, name, phone, signupReason, dateOfBirth, currentAge } = await req.json();

    if (!email || !password || !name || !phone || !signupReason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    let canUpdateToDonor = false;
    let profileUpdatableAt = null;
    let finalSignupReason = signupReason;
    let age = 0;
    const role = 'user';

    // Calculate age and determine appropriate signup reason
    if (signupReason === 'ageRestriction') {
      if (!dateOfBirth) {
        return NextResponse.json({ error: 'Date of birth is required for age restriction' }, { status: 400 });
      }
      
      age = calculateAge(dateOfBirth);
      
      // Determine the specific age-based reason
      if (age < 18) {
        finalSignupReason = 'underAge';
        canUpdateToDonor = false;
        const eligibleDate = new Date(dateOfBirth);
        eligibleDate.setFullYear(eligibleDate.getFullYear() + 18);
        profileUpdatableAt = eligibleDate;
      } else if (age > 65) {
        finalSignupReason = 'aboveAge';
        canUpdateToDonor = false;
        profileUpdatableAt = null;
      } else {
        // Age is between 18-65, so they can be a donor
        finalSignupReason = 'donateLater';
        canUpdateToDonor = true;
        profileUpdatableAt = null;
      }
    } else if (signupReason === 'healthIssue') {
      canUpdateToDonor = false;
    } else if (signupReason === 'donateLater') {
      canUpdateToDonor = true;
      profileUpdatableAt = null;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      phone,
      signupReason: finalSignupReason,
      dateOfBirth,
      currentAge: age || currentAge,
      role,
      canUpdateToDonor,
      profileUpdatableAt
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });

    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}