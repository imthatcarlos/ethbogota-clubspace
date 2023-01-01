import { NextApiRequest, NextApiResponse } from "next";
import redisClient from "@/lib/utils/redisClient";
import { appendToField } from "@/lib/utils/privyClient";
import { Identity } from "@semaphore-protocol/identity";

import { VERIFIER_ADDRESS, JSON_RPC_URL_POKT } from "@/lib/consts";
import { Contract, providers, Wallet, utils, BigNumber } from "ethers";
import contractAbi from "../../../lib/semaphore/abi.json";
import { formatBytes32String } from "ethers/lib/utils.js";

const provider = new providers.JsonRpcProvider(JSON_RPC_URL_POKT);
const signer = new Wallet(process.env.ADMIN_KEY, provider);
const contract = new Contract(VERIFIER_ADDRESS, contractAbi, signer);

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
