import { NextApiRequest, NextApiResponse } from "next";
import redisClient from "@/lib/utils/redisClient";
import { appendToField } from "@/lib/utils/privyClient";
import { Identity } from "@semaphore-protocol/identity";

import { VERIFIER_ADDRESS, JSON_RPC_URL_POKT } from "@/lib/consts";
import { Contract, providers, Wallet, utils, BigNumber } from "ethers";
import contractAbi from "../../../lib/semaphore/abi.json";

const provider = new providers.JsonRpcProvider(JSON_RPC_URL_POKT);
const signer = new Wallet(process.env.ADMIN_KEY, provider);
const contract = new Contract(VERIFIER_ADDRESS, contractAbi, signer);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { identity, username, groupId, address } = req.body;

  console.log(identity, username, groupId);

  const REDIS_KEY_JOINED_SPACE = `joined-${groupId}-${address}`;

  const hasJoined = await redisClient.get(REDIS_KEY_JOINED_SPACE);
  if (hasJoined) {
    console.log('skipping semaphore/privy - already joined the space');
    return res.status(200).end();
  }

  const identityObject = new Identity(identity);
  const identityCommitment = identityObject.generateCommitment().toString();

  try {
    console.log("setting redis");
    const newLength = await redisClient.lpush(`rolecall-${groupId}`, [identityCommitment.toString()]);
    console.log(`wrote to redis for id commitment for semGroupIdHex: ${groupId} (length: ${newLength})`);

    const newEntry = {
      groupId,
      identity,
      claimed: false,
    };
    await appendToField(address, "clubspace-attendance", newEntry);
    console.log('wrote to privy');

    const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await provider.getFeeData();
    console.log('joining group...');
    const transaction = await contract.joinGroup(
      identityCommitment,
      utils.formatBytes32String(username || address),
      BigNumber.from(groupId),
      { gasLimit: 2100000, gasPrice }
    );

    await transaction.wait();
    console.log(`joined semaphore group: ${transaction.hash}`);

    await redisClient.set(REDIS_KEY_JOINED_SPACE, '1');
    res.status(200).end();
  } catch (error) {
    console.log(error.stack);
    res.status(500).end();
  }
};

export default handler;
