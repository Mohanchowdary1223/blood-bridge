/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UnblockRequest from '@/models/UnblockRequest';
import BlockedUser from '@/models/BlockedUser';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const { userId, message } = await req.json();
  if (!userId || !message) {
    return NextResponse.json({ error: 'userId and message are required' }, { status: 400 });
  }
  // Find blocked user for context (convert userId to ObjectId)
  let blocked = null;
  try {
    blocked = await BlockedUser.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }
  if (!blocked) {
    return NextResponse.json({ error: 'User is not blocked' }, { status: 404 });
  }
  // Create unblock request in new collection
  await UnblockRequest.create({
    userId: blocked.userId.toString(),
    userName: blocked.name,
    userEmail: blocked.email,
    message,
    date: new Date(),
    blockedReason: blocked.reason && blocked.reason.trim() ? blocked.reason : 'No reason provided',
    status: 'blocked',
  });
  return NextResponse.json({ success: true });
}

export async function GET() {
  await connectToDatabase();
  // Return all unblock requests for admin-mails page
  const requests = await UnblockRequest.find({}).sort({ date: -1 });
  return NextResponse.json({ requests });
}
