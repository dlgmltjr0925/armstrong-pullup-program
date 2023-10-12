import { NextApiRequest, NextApiResponse } from 'next';

import { deleteProfile } from '../../../utils/profile';

const handler = (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (_req.method === 'DELETE') {
      const id = _req.query.id as string;
      const profile = deleteProfile(parseInt(id, 10));
      res.status(200).json({ profile });
    }
  } catch (err: any) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export default handler;
