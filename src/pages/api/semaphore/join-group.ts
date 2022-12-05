import { NextApiRequest, NextApiResponse } from "next";
import redisClient from "@/lib/utils/redisClient";
import { appendToField } from "@/lib/utils/privyClient";
import { Identity } from "@semaphore-protocol/identity";

import { VERIFIER_ADDRESS } from "@/lib/consts";
import { Contract, providers, Wallet, utils, BigNumber } from "ethers";
import contractAbi from "../../../lib/semaphore/abi.json";

const provider = new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_MUMBAI_URL);
const signer = new Wallet(process.env.ADMIN_KEY, provider);
const contract = new Contract(VERIFIER_ADDRESS, contractAbi, signer);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { identity, username, groupId, address } = req.body;

  console.log(identity, username, groupId);

  const identityObject = new Identity(identity);

  const identityCommitment = identityObject.generateCommitment().toString();

  try {
    console.log("setting redis");
    await redisClient.lpush(`rolecall-${groupId}`, [identityCommitment.toString()]);
    console.log(`wrote to redis for id commitment for semGroupIdHex: ${groupId}`);

    // write to privy also
    const newEntry = {
      groupId,
      identity,
      claimed: false,
    };
    await appendToField(address, "clubspace-attendance", newEntry);

    // @TODO: NATE - thought we were sponsoring this? lol
    const transaction = await contract.joinGroup(
      identityCommitment,
      utils.formatBytes32String(username),
      BigNumber.from(groupId)
    );
    console.log(transaction.hash);

    await transaction.wait();

    console.log("set!");
  } catch (error) {
    console.log(error.stack);
  }

  res.status(200).end();
};

export default handler;
