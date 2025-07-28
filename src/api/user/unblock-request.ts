import { connectToDatabase } from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import BlockedUser from '@/models/BlockedUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, message } = req.body;
  const blocked = await BlockedUser.findOne({ userId });
  if (!blocked) return res.status(404).json({ error: 'Blocked user not found' });

  if (!blocked.unblockRequests) blocked.unblockRequests = [];
  blocked.unblockRequests.push({ message, date: new Date() });
  await blocked.save();

  res.status(200).json({ success: true });
}
