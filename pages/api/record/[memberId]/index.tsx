import { NextApiRequest, NextApiResponse } from 'next';
import { insertRecord, updateRecord } from '../../../../utils/record';

const handler = (_req: NextApiRequest, res: NextApiResponse) => {
  const memberId = _req.query.memberId as string;
  try {
    if (_req.method === 'POST') {
      const result = insertRecord({
        memberId: parseInt(memberId, 10),
        ..._req.body.record,
      });
      if (typeof result === 'number') {
        return res.status(202).json({ id: result })
      }
      res.status(200).json({ record: result });
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
