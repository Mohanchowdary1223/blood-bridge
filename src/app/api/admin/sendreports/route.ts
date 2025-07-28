import { NextRequest, NextResponse } from 'next/server';
import AdminSendReport from '@/models/AdminSendReports';
import { connectToDatabase } from '@/lib/mongodb';

// GET: Fetch all admin sent reports for a user
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const reports = await AdminSendReport.find({ userId }).sort({ sentAt: -1 });
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('GET admin sent reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin sent reports' }, { status: 500 });
  }
}
