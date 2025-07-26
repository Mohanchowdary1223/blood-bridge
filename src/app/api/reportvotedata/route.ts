import { NextRequest, NextResponse } from 'next/server';
import Notification from '@/models/reportvotedata/Notification';
import { connectToDatabase } from '@/lib/mongodb';

// GET: Fetch notifications for a user
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    const notifications = await Notification.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    }).sort({ timestamp: -1 });
    
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('GET notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST: Create a new notification
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    // Validate required fields
    const { type, title, description, sender, receiver } = body;
    if (!type || !title || !description || !sender || !receiver) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, title, description, sender, receiver' 
      }, { status: 400 });
    }
    
    const notification = await Notification.create({
      ...body,
      timestamp: new Date(),
      status: 'unread',
    });
    
    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('POST notification error:', error);
    return NextResponse.json({ 
      error: 'Failed to create notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH: Update notification (mark as read, star/unstar)
export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { notificationId, updates } = body;
    
    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
    }

    // Validate that notificationId is a valid MongoDB ObjectId
    if (!notificationId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid notificationId format' }, { status: 400 });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { 
        ...updates,
        updatedAt: new Date() // Add updatedAt field
      },
      { new: true }
    );
    
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    
    return NextResponse.json({ notification });
  } catch (error) {
    console.error('PATCH notification error:', error);
    return NextResponse.json({ 
      error: 'Failed to update notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE: Remove a notification
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('notificationId');
    
    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
    }

    // Validate that notificationId is a valid MongoDB ObjectId
    if (!notificationId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid notificationId format' }, { status: 400 });
    }

    const notification = await Notification.findByIdAndDelete(notificationId);
    
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('DELETE notification error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
