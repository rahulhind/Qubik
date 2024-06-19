// pages/api/user/settings.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../libs/dbConnect';
import User, { UserType } from '../../../models/User'; // Corrected import to include UserType

type PostRequestData = {
  userId: string;
  notifications: boolean;
  privacy: string;
  chatPreferences: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ error: string } | UserType>) {
  const { method } = req;

  await dbConnect();

  if (method === 'POST') {
    try {
      const { userId, notifications, privacy, chatPreferences } = req.body as PostRequestData;
      const updatedUser = await User.findByIdAndUpdate(userId, {
        settings: { notifications, privacy, chatPreferences }
      }, { new: true });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
