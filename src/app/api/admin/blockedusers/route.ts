
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BlockedUser from '@/models/BlockedUser';
import User from '@/models/User';
import Donor from '@/models/Donor';

export async function GET() {
  await connectToDatabase();
  // Get all blocked users, join with user and donor info
  const blocked = await BlockedUser.find({});
  const userIds = blocked.map((b) => b.userId?.toString?.() ?? String(b.userId));
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const donors = await Donor.find({ userId: { $in: userIds } }).lean();

  // Map blocked users with user/donor info
  const result = blocked.map((b) => {
    const user = users.find((u) => u._id.toString() === (b.userId?.toString?.() ?? String(b.userId)));
    const donor = donors.find((d) => {
      const donorUserId = d.userId?.toString?.() ?? String(d.userId);
      const blockedUserId = b.userId?.toString?.() ?? String(b.userId);
      return donorUserId === blockedUserId;
    });
    return {
      ...b.toObject(),
      user,
      donor,
    };
  });
  return NextResponse.json({ blockedUsers: result });
}
