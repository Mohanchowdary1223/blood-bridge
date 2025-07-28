import { NextRequest, NextResponse } from 'next/server';
import UserNotification from '@/models/UserNotification';
import MasterNotification from '@/models/MasterNotification';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { donorId, receiverName, message, senderName, title, timestamp } = body;
    
    if (!donorId || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: donorId, message' 
      }, { status: 400 });
    }

    // Create notification object
    const notificationObj = {
      type: 'vote',
      title: title || 'New Vote of Thanks',
      description: `Vote of Thanks from ${senderName || 'Someone'}`,
      sender: senderName || 'Anonymous',
      receiver: donorId,
      receiverName: receiverName || '',
      content: message,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      status: 'unread',
      priority: 'medium'
    };
    // Store in user notifications (deletable copy)
    await UserNotification.create({ userId: donorId, notification: notificationObj });
    // Store in master notifications (permanent copy)
    await MasterNotification.create({ notification: notificationObj });
    return NextResponse.json({ 
      success: true, 
      notification: notificationObj,
      message: 'Thank you message sent successfully!' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Thanks submission error:', error);
    return NextResponse.json({ 
      error: 'Failed to send thank you message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
