import { NextApiRequest, NextApiResponse } from "next";
import redisClient from "@/lib/utils/redisClient";
import { appendToField } from "@/lib/utils/privyClient";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { groupId, address } = req.body;

  const REDIS_KEY_JOINED_SPACE = `joined-${groupId}-${address}`;

  const hasJoined = await redisClient.get(REDIS_KEY_JOINED_SPACE);
  if (hasJoined) {
    console.log('skipping semaphore/privy - already joined the space');
    return res.status(200).end();
  }

  try {
    console.log("setting redis");
    const newLength = await redisClient.lpush(`rolecall-${groupId}`, [address]);
    console.log(`wrote to redis for id commitment for semGroupIdHex: ${groupId} (length: ${newLength})`);

    const newEntry = {
      groupId,
      claimed: false,
    };
    await appendToField(address, "clubspace-attendance", newEntry);
    console.log('wrote to privy');

    await redisClient.set(REDIS_KEY_JOINED_SPACE, '1');
    res.status(200).end();
  } catch (error) {
    console.log(error.stack);
    res.status(500).end();
  }
};

export default handler;
