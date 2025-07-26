import { NextRequest, NextResponse } from 'next/server';
import Notification from '@/models/reportvotedata/Notification';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { donorId, message, senderName, title, timestamp } = body;
    
    if (!donorId || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: donorId, message' 
      }, { status: 400 });
    }

    // Create notification for vote of thanks
    const notification = await Notification.create({
      type: 'vote',
      title: title || 'New Vote of Thanks',
      description: `Vote of Thanks from ${senderName || 'Someone'}`,
      sender: senderName || 'Anonymous', // Always use senderName (user's name)
      receiver: donorId,
      content: message,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      status: 'unread',
      priority: 'medium'
    });
    
    return NextResponse.json({ 
      success: true, 
      notification,
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
