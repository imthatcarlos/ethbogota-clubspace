import { NextApiRequest, NextApiResponse } from "next";
import { appendToField } from "@/lib/utils/privyClient";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // write to privy
  try {
    const { address, semGroupIdHex, impression } = req.body;

    // enforce type check
    if (typeof address !== "string" || typeof semGroupIdHex !== "string" || typeof impression !== "string")
      return res.status(400).end();

    const newEntry = {
      impression,
      timestamp: Date.now(),
      userAgent: req.headers["user-agent"],
    };

    await appendToField(address, semGroupIdHex, newEntry, true);

    console.log(`wrote to privy for semGroupIdHex: ${semGroupIdHex}`);

    return res.status(200).end();
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
};

export default handler;
