import { NextResponse } from 'next/server';
import MasterNotification from '@/models/MasterNotification';
import { connectToDatabase } from '@/lib/mongodb';

// GET: Fetch recent 10 report notifications for admin
export async function GET() {
  try {
    await connectToDatabase();
    // Only fetch type: 'report' notifications, sorted by timestamp desc
    const reports = await MasterNotification.find({ 'notification.type': 'report' })
      .sort({ 'notification.timestamp': -1 })
      .limit(10);
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('GET admin reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
