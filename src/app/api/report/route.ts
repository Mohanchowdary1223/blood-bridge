import { NextRequest, NextResponse } from 'next/server';
import Notification from '@/models/reportvotedata/Notification';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { donorId, reason, details, reporterName,title, timestamp } = body;
    
    if (!donorId || !reason) {
      return NextResponse.json({ 
        error: 'Missing required fields: donorId, reason' 
      }, { status: 400 });
    }

    // Create notification for report
    const notification = await Notification.create({
      type: 'report',
      title: title || 'Donor Report Submitted',
      description: `${reporterName || 'Someone'} reported an issue: ${reason}`,
      sender: reporterName || 'Anonymous', // Always use reporterName (user's name)
      receiver: donorId,
      content: `Reason: ${reason}\n\nDetails: ${details || 'No additional details provided'}`,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      status: 'unread',
      priority: 'high' // Reports typically have higher priority
    });
    
    return NextResponse.json({ 
      success: true, 
      notification,
      message: 'Report submitted successfully!' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Report submission error:', error);
    return NextResponse.json({ 
      error: 'Failed to submit report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
