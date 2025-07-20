"use server"

import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Donor from '@/models/Donor';

export async function GET() {
  try {
    await connectMongo();
    
    const donors = await Donor.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ donors }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
  }
} 