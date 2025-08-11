import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import UsersChatHistory from '@/models/UsersChatHistory';
// import mongoose from 'mongoose';

// Copy a shared chat to the requesting user's history
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.headers['x-user-id'] as string;
  const { chatId } = req.body;

  if (!userId || !chatId) {
    return res.status(400).json({ error: 'Missing userId or chatId' });
  }

  try {
    await connectToDatabase();
    // Find the shared chat by id
    const sharedChat = await UsersChatHistory.findById(chatId).lean();
    // Defensive: if findById returns array, pick first element
    let chatObj = sharedChat;
    if (Array.isArray(sharedChat)) {
      if (sharedChat.length === 0) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      chatObj = sharedChat[0];
    }
    if (!sharedChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Create a copy for the requesting user
    if (!chatObj || typeof chatObj !== 'object' || !('title' in chatObj) || !('messages' in chatObj)) {
      return res.status(500).json({ error: 'Invalid chat data' });
    }
    const newChat = new UsersChatHistory({
      title: chatObj.title,
      messages: chatObj.messages,
      userId,
      createdAt: new Date(),
    });
    await newChat.save();

    return res.status(200).json({ chat: newChat });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to copy chat', details: error });
  }
}
