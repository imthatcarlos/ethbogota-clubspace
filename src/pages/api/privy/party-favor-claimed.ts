import { NextApiRequest, NextApiResponse } from "next";
import { getCurrentContentsData, updateField } from "@/lib/utils/privyClient";
import { providers } from "ethers";
import { JSON_RPC_URL_POKT } from "@/lib/consts";

const provider = new providers.JsonRpcProvider(JSON_RPC_URL_POKT);

// make a call to privy to mark this address/groupId as claimed
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { groupId, address, hash } = req.body;
  try {
    await provider.waitForTransaction(hash);
    let clubSpaceObject = await getCurrentContentsData(address, "clubspace-attendance", false);
    const index = clubSpaceObject.findIndex((x) => x.groupId.toString() === groupId.toString());
    if (index > -1) {
      clubSpaceObject[index].claimed = true;
      await updateField(address, "clubspace-attendance", clubSpaceObject);
    }
    res.status(200).end();
  } catch (error: any) {
    console.error(error);
    res.status(500).end();
  }
};

export default handler;
