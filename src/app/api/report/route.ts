import { NextRequest, NextResponse } from 'next/server';
import UserNotification from '@/models/UserNotification';
import MasterNotification from '@/models/MasterNotification';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { donorId, receiverName, reason, details, reporterName, title, timestamp } = body;
    
    if (!donorId || !reason) {
      return NextResponse.json({ 
        error: 'Missing required fields: donorId, reason' 
      }, { status: 400 });
    }

    // Create notification object
    const notificationObj = {
      type: 'report',
      title: title || 'Donor Report Submitted',
      description: `${reporterName || 'Someone'} reported an issue: ${reason}`,
      sender: reporterName || 'Anonymous',
      receiver: donorId,
      receiverName: receiverName || '',
      content: `Reason: ${reason}\n\nDetails: ${details || 'No additional details provided'}`,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      status: 'unread',
      priority: 'high'
    };
    // Store in user notifications (deletable copy)
    await UserNotification.create({ userId: donorId, notification: notificationObj });
    // Store in master notifications (permanent copy)
    await MasterNotification.create({ notification: notificationObj });
    return NextResponse.json({ 
      success: true, 
      notification: notificationObj,
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
