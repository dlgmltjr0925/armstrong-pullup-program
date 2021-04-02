import { NextApiRequest, NextApiResponse } from 'next';

import { findPushUpRecordByDate } from '../../../../utils/record';

const handler = (_req: NextApiRequest, res: NextApiResponse) => {
  const memberId = _req.query.memberId as string;
  try {
    if (_req.method === 'GET') {
      const date = _req.query.slug as string;
      const records = findPushUpRecordByDate({
        memberId: parseInt(memberId, 10),
        date,
      });
      res.status(200).json({ records });
    }
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export default handler;
