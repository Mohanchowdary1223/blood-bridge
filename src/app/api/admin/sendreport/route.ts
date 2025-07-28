import { NextRequest, NextResponse } from 'next/server';
import AdminSendReport from '@/models/AdminSendReports';
import { connectToDatabase } from '@/lib/mongodb';

// POST: Store admin warning sent to user
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { userId, message, reportId } = body;
    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing userId or message' }, { status: 400 });
    }
    const sentReport = await AdminSendReport.create({ userId, message, reportId });
    return NextResponse.json({ success: true, sentReport });
  } catch (error) {
    console.error('POST admin send report error:', error);
    return NextResponse.json({ error: 'Failed to store admin report' }, { status: 500 });
  }
}
