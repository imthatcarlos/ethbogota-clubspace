import Cors from "cors";
import { NextApiRequest, NextApiResponse } from 'next';
import { REDIS_SPACE_PREFIX } from "@/lib/consts";
import redisClient from '@/lib/utils/redisClient';

const cors = Cors({
  methods: ["HEAD", "GET"],
});

// enable CORS
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { handle } = req.query;
    if (!handle) return res.status(400).json({ error: 'missing param: handle' });

    const spaceRedisKey = `${REDIS_SPACE_PREFIX}/${handle}`;
    const data = await redisClient.get(spaceRedisKey);
    if (!data) return res.status(404).end();

    const spaceObject = JSON.parse(data);

    return res.status(200).json({ spaceObject });
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
}

export default handler;
