import { contract } from "@/lib/semaphore/semaphore";
import { utils } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import redisClient from '@/lib/utils/redisClient';
import { REDIS_SPACE_EXP } from "@/lib/consts";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { identityCommitment, username, groupId } = req.body;

  // [HACK] check if they've joined already
  const data = await redisClient.get(username);
  if (data) return res.status(200).end();

  try {
    const transaction = await contract.joinGroup(identityCommitment, utils.formatBytes32String(username), groupId);

    await transaction.wait();

    // [HACK] log that they have joined - ephemeral
    try {
      console.log('setting redis');
      await redisClient.set(
        username,
        'true',
        'EX',
        REDIS_SPACE_EXP
      );
      console.log('set!');
    } catch (error) {
      console.log(error.stack);
    }

    res.status(200).end();
  } catch (error: any) {
    console.error(error);

    res.status(500).end();
  }
};

export default handler;
