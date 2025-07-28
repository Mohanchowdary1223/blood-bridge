import { connectToDatabase } from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import Donor from '@/models/Donor';
import BlockedUser from '@/models/BlockedUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, reason } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Prevent duplicate block
  const alreadyBlocked = await BlockedUser.findOne({ userId });
  if (alreadyBlocked) return res.status(400).json({ error: 'User already blocked' });

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

  res.status(200).json({ success: true });
}
