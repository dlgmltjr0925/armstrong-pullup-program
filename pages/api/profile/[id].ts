import { NextApiRequest, NextApiResponse } from 'next';

import { deleteProfile } from '../../../utils/profile';

const handler = (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (_req.method === 'DELETE') {
      const id = _req.query.id as string;
      const profile = deleteProfile(parseInt(id, 10));
      if (profile === null) res.status(400).json({});
      else res.status(200).json({});
    }
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export default handler;
