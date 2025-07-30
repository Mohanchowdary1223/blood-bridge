import { NextRequest, NextResponse } from 'next/server';
import UsersChatHistory, { IMessage } from '@/models/UsersChatHistory';
import { connectToDatabase } from '@/lib/mongodb';

const GEMINI_API_KEY = process.env.GEMINI_API;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function getUserId(req: NextRequest): Promise<string> {
  return req.headers.get('x-user-id') || 'demo-user';
}

function isHealthRelated(message: string): boolean {
  const messageLower = message.toLowerCase().trim();
  
  // DEFINITE NON-HEALTH TOPICS - Only block these obvious ones
  const absoluteNonHealth = [
    'programming', 'coding', 'javascript', 'python', 'software', 'website development',
    'business profit', 'stock trading', 'cryptocurrency', 'bitcoin', 'marketing strategy',
    'movie review', 'music album', 'video game', 'netflix', 'entertainment news',
    'weather forecast', 'climate change', 'temperature today',
    'car repair', 'vehicle maintenance', 'driving license', 'auto insurance',
    'fashion trends', 'makeup tutorial', 'clothing style', 'beauty products',
    'political election', 'government policy', 'voting', 'legal advice'
  ];

  // If it contains obvious non-health keywords, block it
  const isDefinitelyNonHealth = absoluteNonHealth.some(term => 
    messageLower.includes(term)
  );
  
  if (isDefinitelyNonHealth) {
    return false;
  }

  // Everything else is potentially health-related (inclusive approach)
  return true;
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

    // ENHANCED HEALTHCARE-ONLY SYSTEM PROMPT
    const systemPrompt = `You are a comprehensive healthcare assistant that ONLY answers health, medical, and wellness-related questions.

YOU MUST ANSWER questions about:
✅ Health definitions (what is healthcare, what is health, medical terms)
✅ Medical conditions, symptoms, diseases, treatments
✅ Hospitals, clinics, doctors, medical facilities, healthcare services
✅ Medications, prescriptions, medical procedures, surgery
✅ Nutrition, diet, healthy foods, vitamins, supplements
✅ Exercise, fitness, physical therapy, sports medicine
✅ Mental health, therapy, stress management, wellness
✅ Body parts, anatomy, medical devices, health tools
✅ Preventive care, health screenings, medical checkups
✅ Women's health, men's health, child health, elderly care

RESPONSE LENGTH:
- Simple questions: 3-5 clear lines
- Moderate questions: 8-12 detailed lines  
- Complex questions: 15-25 comprehensive lines

STRICT RULE: If asked about non-health topics (technology, business, entertainment, politics, etc.), respond EXACTLY: "I'm a healthcare assistant and can only help with health, medical, wellness, fitness, nutrition, and healthcare-related questions. Please ask me about your health concerns or medical topics."

Always provide accurate health information and recommend consulting healthcare professionals for serious medical concerns.`;

    // Use inclusive health detection (only block obvious non-health topics)
    if (!isHealthRelated(message)) {
      const botText = "I'm a healthcare assistant and can only help with health, medical, wellness, fitness, nutrition, and healthcare-related questions. Please ask me about your health concerns or medical topics.";
      
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
    }

    // Get existing chat history if continuing a conversation
    let existingChat = null;
    if (chatId) {
      existingChat = await UsersChatHistory.findOne({ _id: chatId, userId });
    }

    // Build conversation history for Gemini
    const geminiContents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      }
    ];

    // Add previous conversation history (limit to last 20 messages for performance)
    if (existingChat && existingChat.messages) {
      const recentMessages = existingChat.messages.slice(-20);
      recentMessages.forEach((msg: IMessage) => {
        if (msg.sender === 'user') {
          geminiContents.push({
            role: 'user',
            parts: [{ text: msg.text }]
          });
        } else if (msg.sender === 'bot') {
          geminiContents.push({
            role: 'model',
            parts: [{ text: msg.text }]
          });
        }
      });
    }

    // Add the current user message
    geminiContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Process health-related questions with Gemini (with full context)
    const geminiPayload = {
      contents: geminiContents
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
    const botText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 
      'I apologize, but I encountered an issue processing your health question. Please try rephrasing your question or consult with a healthcare professional.';

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
