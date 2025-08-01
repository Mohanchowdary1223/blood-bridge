export async function DELETE(req: NextRequest) {
  try {
    await connectMongo();
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    await DonorScheduleDonation.deleteOne({ userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '../../../lib/mongodb';
import DonorScheduleDonation from '../../../models/donorscheduledonation/DonorScheduleDonation';

export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    const { userId, scheduledDate } = await req.json();
    if (!userId || !scheduledDate) {
      return NextResponse.json({ error: 'Missing userId or scheduledDate' }, { status: 400 });
    }
    // Upsert: one schedule per user
    const result = await DonorScheduleDonation.findOneAndUpdate(
      { userId },
      { scheduledDate },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ success: true, schedule: result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const schedule = await DonorScheduleDonation.findOne({ userId });
    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
