"use server"

import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import DonorAvailability from '@/models/donoralltypedata/DonorAvailability';
import mongoose from 'mongoose';

// GET: Fetch availability for a user (by userId)
export async function GET(req: NextRequest) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid or missing userId' }, { status: 400 });
    }
    const availability = await DonorAvailability.findOne({ userId });
    if (!availability) {
      return NextResponse.json({ error: 'No availability data found' }, { status: 404 });
    }
    return NextResponse.json({ availability }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

// POST: Update or create availability for a user
export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    const body = await req.json();
    const { userId, isAvailable, availableDate } = body;
    if (!userId || typeof isAvailable !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const update: Record<string, unknown> = { isAvailable };
    if (!isAvailable && availableDate) {
      update.availableDate = availableDate;
    } else {
      update.availableDate = null;
    }
    const result = await DonorAvailability.findOneAndUpdate(
      { userId },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ availability: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}
