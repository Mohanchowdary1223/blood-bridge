"use server"

import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Donor from '@/models/Donor';

export async function GET(req: NextRequest) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const filter: Record<string, unknown> = {};
    if (searchParams.get('bloodType')) filter.bloodType = searchParams.get('bloodType');
    if (searchParams.get('country')) filter.country = searchParams.get('country');
    if (searchParams.get('state')) filter.state = searchParams.get('state');
    if (searchParams.get('city')) filter.city = searchParams.get('city');
    if (searchParams.get('isAvailable')) filter.isAvailable = searchParams.get('isAvailable') === 'true';
    const donors = await Donor.find(filter).sort({ createdAt: -1 });
    // Map donors to include userId as string
    const donorsWithUserId = donors.map(donor => ({
      ...donor.toObject(),
      userId: donor.userId?.toString() || '',
    }));
    return NextResponse.json({ donors: donorsWithUserId }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
  }
} 