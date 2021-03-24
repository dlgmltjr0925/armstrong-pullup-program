import { NextApiRequest, NextApiResponse } from 'next';

import { getAllProfiles } from '../../../utils/profile';

const handler = (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (_req.method === 'GET') {
      const profiles = getAllProfiles();
      res.status(200).json({
        profiles,
      });
    }
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export default handler;
