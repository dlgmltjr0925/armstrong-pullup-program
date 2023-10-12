import { NextApiRequest, NextApiResponse } from 'next';
import { deleteRecord, findRecordByDate } from '../../../../utils/record';

const handler = (_req: NextApiRequest, res: NextApiResponse) => {
  const memberId = _req.query.memberId as string;
  try {
    if (_req.method === 'GET') {
      const date = _req.query.slug as string;
      const records = findRecordByDate({
        memberId: parseInt(memberId, 10),
        date,
      });
      res.status(200).json({ records });
    } else if (_req.method === 'DELETE') {
      const id = _req.query.slug as string;
      const record = deleteRecord({
        memberId: parseInt(memberId, 10),
        id: parseInt(id, 10),
      });
      res.status(200).json({ record });
    }
  } catch (err: any) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export default handler;
