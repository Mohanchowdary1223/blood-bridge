import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BlockedUser from '@/models/BlockedUser';
import User from '@/models/User';
import Donor from '@/models/Donor';
import UnblockRequest from '@/models/UnblockRequest';

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  // Find blocked user entry
  const blocked = await BlockedUser.findOne({ userId });
  if (!blocked) return NextResponse.json({ error: 'User is not blocked' }, { status: 404 });

  // Restore user role
  const user = await User.findById(userId);
  if (user) {
    user.role = blocked.roleBeforeBlock || 'user';
    await user.save();
  }

  // If donor, restore donor role
  if (blocked.roleBeforeBlock === 'donor') {
    const donor = await Donor.findOne({ userId });
    if (donor) {
      donor.role = 'donor';
      await donor.save();
    }
  }

  // Remove from blocked list
  await BlockedUser.deleteOne({ userId });

  // Update unblock requests for this user to status 'unblocked'
  await UnblockRequest.updateMany({ userId: userId.toString() }, { $set: { status: 'unblocked' } });

  return NextResponse.json({ success: true });
}
