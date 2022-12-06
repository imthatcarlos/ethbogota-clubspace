import { NextApiRequest, NextApiResponse } from "next";
import redisClient from "@/lib/utils/redisClient";
import { appendToField } from "@/lib/utils/privyClient";
import { Identity } from "@semaphore-protocol/identity";

import { VERIFIER_ADDRESS, JSON_RPC_URL_ALCHEMY } from "@/lib/consts";
import { Contract, providers, Wallet, utils, BigNumber } from "ethers";
import contractAbi from "../../../lib/semaphore/abi.json";

const provider = new providers.JsonRpcProvider(JSON_RPC_URL_ALCHEMY);
const signer = new Wallet(process.env.ADMIN_KEY, provider);
const contract = new Contract(VERIFIER_ADDRESS, contractAbi, signer);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { identity, username, groupId, address } = req.body;

  console.log(identity, username, groupId);

  const identityObject = new Identity(identity);

  const identityCommitment = identityObject.generateCommitment().toString();

  try {
    console.log("setting redis");
    const newLength = await redisClient.lpush(`rolecall-${groupId}`, [identityCommitment.toString()]);
    console.log(`wrote to redis for id commitment for semGroupIdHex: ${groupId} (length: ${newLength})`);

    // only doing this once...
    if (newLength === 1) {
      const newEntry = {
        groupId,
        identity,
        claimed: false,
      };
      await appendToField(address, "clubspace-attendance", newEntry);
      console.log('wrote to privy');

      const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();
      const transaction = await contract.joinGroup(
        identityCommitment,
        utils.formatBytes32String(username),
        BigNumber.from(groupId),
        { maxFeePerGas, maxPriorityFeePerGas }
      );

      await transaction.wait();
      console.log(`joined semaphore group: ${transaction.hash}`);
    }
  } catch (error) {
    console.log(error.stack);
  }

  res.status(200).end();
};

export default handler;
