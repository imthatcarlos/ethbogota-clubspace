import { BigNumber, utils } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import redisClient from "@/lib/utils/redisClient";
import { REDIS_SPACE_EXP } from "@/lib/consts";

import { VERIFIER_ADDRESS } from "@/lib/consts";
import { Contract, providers, Wallet } from "ethers";
import contractAbi from "../../../lib/semaphore/abi.json";

const provider = new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_MUMBAI_URL);
const signer = new Wallet(process.env.ADMIN_KEY, provider);
const contract = new Contract(VERIFIER_ADDRESS, contractAbi, signer);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { identityCommitment, username, groupId } = req.body;

  // [HACK] check if they've joined already
  // const data = await redisClient.get(username);
  // if (data) return res.status(200).end();

  console.log(identityCommitment, username, groupId)

  try {
    const transaction = await contract.joinGroup(identityCommitment, utils.formatBytes32String(username), BigNumber.from(groupId));
    console.log(transaction.hash)

    await transaction.wait();

    // [HACK] log that they have joined - ephemeral
    try {
      console.log("setting redis");
      await redisClient.set(username, "true", "EX", REDIS_SPACE_EXP);
      console.log("set!");
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
