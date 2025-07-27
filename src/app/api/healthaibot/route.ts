import { NextRequest, NextResponse } from 'next/server';
import UsersChatHistory, { IMessage } from '@/models/UsersChatHistory';
import { connectToDatabase } from '@/lib/mongodb';

const GEMINI_API_KEY = 'AIzaSyCeSwEPezpqP9UV6HP1UflRbAN3A4otV4o'; // Move to environment variable
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function getUserId(req: NextRequest): Promise<string> {
  // In production, replace with real auth/session
  return req.headers.get('x-user-id') || 'demo-user';
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getUserId(req);
    const history = await UsersChatHistory.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getUserId(req);
    const { chatId, message, title } = await req.json();

    // Dynamic system prompt based on question complexity
    const systemPrompt = `You are a healthcare assistant. Adjust your response length based on the complexity and importance of the question:

For simple questions (like greetings, basic definitions): Provide concise answers in 3-5 lines.
For moderate questions (symptoms, general health advice): Provide detailed responses in 8-12 lines.
For complex questions (conditions, treatments, detailed explanations): Provide comprehensive responses in 15-25 lines.

Always structure your responses appropriately:
- Simple: Direct answer with brief explanation
- Moderate: Acknowledgment, explanation, basic advice, when to seek help
- Complex: Acknowledgment, detailed explanation with background, comprehensive advice, important warnings, professional consultation emphasis

Use accessible language that patients can understand. Include specific examples when helpful for complex topics. Maintain medical accuracy while being educational. Never provide specific diagnoses or replace professional medical consultation. For serious health concerns, always emphasize consulting healthcare professionals.

Format responses in clear, readable paragraphs. Be empathetic and supportive while providing appropriate depth of information based on the question's complexity.`;

    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ]
    };

    const geminiRes = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('Gemini API error details:', errorText);
      throw new Error(`Gemini API error: ${geminiRes.status} - ${errorText}`);
    }

    const geminiData = await geminiRes.json();
    const botText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not answer that. Please try rephrasing your question or consult with a healthcare professional.';

    const userMsg: IMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    const botMsg: IMessage = {
      id: (Date.now() + 1).toString(),
      text: botText,
      sender: 'bot',
      timestamp: new Date(),
    };

    let chat;
    if (chatId) {
      chat = await UsersChatHistory.findOneAndUpdate(
        { _id: chatId, userId },
        { $push: { messages: { $each: [userMsg, botMsg] } } },
        { new: true }
      );
    } else {
      chat = await UsersChatHistory.create({
        userId,
        title: title || message.slice(0, 30) + (message.length > 30 ? '…' : ''),
        messages: [userMsg, botMsg],
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ chat, botMsg });
  } catch (error) {
    console.error('Failed to process chat message:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await getUserId(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing chat ID' }, { status: 400 });
    }
    
    const result = await UsersChatHistory.deleteOne({ _id: id, userId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
