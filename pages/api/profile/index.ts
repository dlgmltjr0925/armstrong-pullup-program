import { NextApiRequest, NextApiResponse } from 'next';
import { getAllProfiles, insertProfile } from '../../../utils/profile';

const handler = (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (_req.method === 'GET') {
      const profiles = getAllProfiles();
      res.status(200).json({
        profiles,
      });
    } else if (_req.method === 'POST') {
      const { nickname } = _req.body;
      const profile = insertProfile(nickname);
      res.status(200).json({
        profile,
      });
    }
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export default handler;
