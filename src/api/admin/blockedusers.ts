import { connectToDatabase } from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import BlockedUser from '@/models/BlockedUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (req.method !== 'GET') return res.status(405).end();

  const blockedUsers = await BlockedUser.find();
  res.status(200).json(blockedUsers);
}
