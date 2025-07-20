
"use server"

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectMongo } from '@/lib/mongodb';
import User from '@/models/User';
import Donor from '@/models/Donor';

export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    const body = await req.json();
    const requiredFields = [
      'fullName', 'email', 'password', 'phone', 'bloodType', 'dob', 'gender', 'weight', 'height', 'country', 'state', 'city'
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
      }
    }
    const existing = await User.findOne({ email: body.email });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // Create user record
    const user = await User.create({
      email: body.email,
      password: hashedPassword,
      name: body.fullName,
      phone: body.phone,
      role: 'donor',
      canUpdateToDonor: true,
      profileUpdatableAt: null,
    });

    // Create donor record
    await Donor.create({
      userId: user._id,
      email: body.email,
      name: body.fullName,
      phone: body.phone,
      bloodType: body.bloodType,
      dob: body.dob,
      gender: body.gender,
      weight: body.weight,
      height: body.height,
      country: body.country,
      state: body.state,
      city: body.city,
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : null,
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
} 