"use server"

import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import User from '@/models/User';
import Donor from '@/models/Donor';

export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    const body = await req.json();
    const { userId, name, phone, signupReason, bloodType, dob, gender, weight, height, country, state, city, role, isAvailable } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update basic user fields
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

    // If donor fields are provided, create/update donor record
    if (bloodType && dob && gender && weight && height && country && state && city) {
      // Check if donor record exists
      let donor = await Donor.findOne({ userId: user._id });
      
      if (donor) {
        // Update existing donor record
        donor.bloodType = bloodType;
        donor.dob = dob;
        donor.gender = gender;
        donor.weight = weight;
        donor.height = height;
        donor.country = country;
        donor.state = state;
        donor.city = city;
        donor.isAvailable = isAvailable !== undefined ? isAvailable : null;
        await donor.save();
      } else {
        // Create new donor record
        donor = await Donor.create({
          userId: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          bloodType,
          dob,
          gender,
          weight,
          height,
          country,
          state,
          city,
          isAvailable: isAvailable !== undefined ? isAvailable : null,
        });
      }
    }

    await user.save();
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Profile edit failed' }, { status: 500 });
  }
} 