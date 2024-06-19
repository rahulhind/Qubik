// pages/api/user/[...path].ts

import type { NextApiRequest, NextApiResponse } from 'next';

const protectedHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.headers.authorization || '';

  try {
    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Proceed with the request
    // Example: Fetching user data or updating user data
    res.status(200).json({ message: 'Success', data: {} });
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
};

export default protectedHandler;
