import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UsersChatHistory from '@/models/UsersChatHistory';

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const body = await req.json();
  const { chatId } = body;

  if (!userId || !chatId) {
    return NextResponse.json({ error: 'Missing userId or chatId' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    // Check if this user already has a copy of this shared chat
    const existingCopy = await UsersChatHistory.findOne({ userId, originalSharedId: chatId });
    if (existingCopy) {
      return NextResponse.json({ chat: existingCopy });
    }
    // Find the shared chat by id
    const sharedChat = await UsersChatHistory.findById(chatId).lean();
    let chatObj = sharedChat;
    if (Array.isArray(sharedChat)) {
      if (sharedChat.length === 0) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }
      chatObj = sharedChat[0];
    }
    if (!sharedChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    if (!chatObj || typeof chatObj !== 'object' || !('title' in chatObj) || !('messages' in chatObj)) {
      return NextResponse.json({ error: 'Invalid chat data' }, { status: 500 });
    }
    const newChat = new UsersChatHistory({
      title: chatObj.title,
      messages: chatObj.messages,
      userId,
      createdAt: new Date(),
      originalSharedId: chatId,
    });
    await newChat.save();
    return NextResponse.json({ chat: newChat });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to copy chat', details: String(error) }, { status: 500 });
  }
}
