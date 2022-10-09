import { NextApiRequest, NextApiResponse } from "next";
import { PrivyClient } from "@privy-io/privy-node";
import { getAddress } from "ethers/lib/utils";

const client = new PrivyClient(
  process.env.PRIVY_API_KEY!,
  process.env.PRIVY_API_SECRET!,
);

const getDecoded = (data: any): string | null => {
  return data ? new TextDecoder().decode(data.plaintext) : null;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // write to privy
  try {
    const { address, semGroupIdHex, impression } = req.body;

    // enforce type check
    if (
      typeof address !== "string" ||
      typeof semGroupIdHex !== "string" ||
      typeof impression !== "string"
    )
      return;

    // get current contents of field
    const checkSummed = getAddress(address);
    const previousData = await client.get(checkSummed, semGroupIdHex);
    const decoded = getDecoded(previousData);

    // format the current data to include the new impression
    const newEntry = {
      impression,
      timestamp: Date.now(),
      userAgent: req.headers["user-agent"],
    };
    const newData = decoded ? JSON.parse(decoded).concat(newEntry) : [newEntry];
    const newDataString = JSON.stringify(newData);

    // write it back
    await client.put(checkSummed, semGroupIdHex, newDataString);

    return res.status(200).end();
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
}

export default handler;
