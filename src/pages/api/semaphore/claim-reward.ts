import { contract } from "@/lib/semaphore/semaphore";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { groupId, recipient, merkleRoot, nullifierHash, solidityProof } = req.body;

  try {
    const transaction = await contract.claim(groupId, recipient, merkleRoot, nullifierHash, solidityProof);

    await transaction.wait();

    res.status(200).end();
  } catch (error: any) {
    console.error(error);

    res.status(500).end();
  }
};

export default handler;
