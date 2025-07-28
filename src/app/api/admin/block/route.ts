import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Donor from '@/models/Donor';
import BlockedUser from '@/models/BlockedUser';
import UnblockRequest from '@/models/UnblockRequest';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const body = await req.json();
  const { userId, reason } = body;
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });


  // Prevent duplicate block
  const alreadyBlocked = await BlockedUser.findOne({ userId });
  if (alreadyBlocked) {
    // If user is already blocked, update unblock requests to status 'blocked' for consistency
    await UnblockRequest.updateMany({ userId: userId.toString() }, { $set: { status: 'blocked' } });
    return NextResponse.json({ error: 'User already blocked' }, { status: 400 });
  }

  const roleBeforeBlock = user.role;
  user.role = 'blocked';
  await user.save();

  if (roleBeforeBlock === 'donor') {
    const donor = await Donor.findOne({ userId });
    if (donor) {
      donor.role = 'blocked';
      await donor.save();
    }
  }

  await BlockedUser.create({
    userId,
    email: user.email,
    name: user.name,
    roleBeforeBlock,
    reason,
    unblockRequests: [],
  });

  // Also update unblock requests to status 'blocked' if user is re-blocked
  await UnblockRequest.updateMany({ userId: userId.toString() }, { $set: { status: 'blocked' } });

  return NextResponse.json({ success: true }, { status: 200 });
}
