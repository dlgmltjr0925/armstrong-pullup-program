import { NextApiRequest, NextApiResponse } from 'next';
import { insertRecord, updateRecord } from '../../../../utils/record';

const handler = (_req: NextApiRequest, res: NextApiResponse) => {
  const memberId = _req.query.memberId as string;
  try {
    if (_req.method === 'POST') {
      const record = insertRecord({
        memberId: parseInt(memberId, 10),
        ..._req.body.record,
      });
      if (record === null) return res.status(400).json({});
      res.status(200).json({ record });
    } else if (_req.method === 'PUT') {
      const record = updateRecord({
        memberId: parseInt(memberId, 10),
        ..._req.body.record,
      });
      res.status(200).json({ record });
    }
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export default handler;
