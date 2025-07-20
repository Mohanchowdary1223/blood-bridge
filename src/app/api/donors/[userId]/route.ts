"use server"

import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Donor from '@/models/Donor';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectMongo();
    
    const { userId } = await params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    
    const donor = await Donor.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }
    
    return NextResponse.json({ donor }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch donor' }, { status: 500 });
  }
} 