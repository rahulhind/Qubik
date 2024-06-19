// pages/api/user/profile.ts or any other API route file

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../libs/dbConnect';
import User, { UserType } from '../../../models/User'; // Notice the adjusted import here

type PostRequestData = {
  userId: string;
  name: string;
  avatar: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ error: string } | UserType>) { // Use UserType for response typing
  const { method } = req;

  await dbConnect();

  if (method === 'POST') {
    try {
      const { userId, name, avatar } = req.body as PostRequestData;
      const updatedUser = await User.findByIdAndUpdate(userId, {
        name,
        avatar
      }, { new: true });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
