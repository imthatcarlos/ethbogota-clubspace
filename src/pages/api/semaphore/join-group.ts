import { contract } from "@/lib/semaphore/semaphore";
import { utils } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { identityCommitment, username, groupId } = req.body;

  // TODO (carlos) : check redis

  try {
    const transaction = await contract.joinGroup(identityCommitment, utils.formatBytes32String(username), groupId);

    await transaction.wait();

	// TODO (carlos) : add to redis

    res.status(200).end();
  } catch (error: any) {
    console.error(error);

    res.status(500).end();
  }
};

export default handler;
