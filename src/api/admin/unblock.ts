import { connectToDatabase } from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import Donor from '@/models/Donor';
import BlockedUser from '@/models/BlockedUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (req.method !== 'POST') return res.status(405).end();

  const { userId } = req.body;
  const blocked = await BlockedUser.findOne({ userId });
  if (!blocked) return res.status(404).json({ error: 'Blocked user not found' });

  const user = await User.findById(userId);
  if (user) {
    user.role = blocked.roleBeforeBlock;
    await user.save();
  }

  if (blocked.roleBeforeBlock === 'donor') {
    const donor = await Donor.findOne({ userId });
    if (donor) {
      donor.role = 'donor';
      await donor.save();
    }
  }

  await BlockedUser.deleteOne({ userId });
  res.status(200).json({ success: true });
}
