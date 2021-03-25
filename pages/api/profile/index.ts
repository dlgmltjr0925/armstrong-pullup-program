import { NextApiRequest, NextApiResponse } from 'next';
import {
  deleteProfile,
  getAllProfiles,
  insertProfile,
} from '../../../utils/profile';

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
    } else if (_req.method === 'DELETE') {
      const { id } = _req.body;
      const profile = deleteProfile(id);
      if (profile === null) res.status(404).json({});
      else res.status(200).json({});
    }
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export default handler;
