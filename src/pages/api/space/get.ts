import { NextApiRequest, NextApiResponse } from 'next';
import redisClient from '@/lib/utils/redisClient';
import { getContractData } from '@/lib/utils/decent';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { lensHandle } = req.query;
    if (!lensHandle) return res.status(400).json({ error: 'missing param: lensHandle' });

    const data = await redisClient.get(lensHandle);
    if (!data) return res.status(404).end();

    const clubSpaceObject = JSON.parse(data);

    return res.status(200).json({ clubSpaceObject });
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
}

export default handler
