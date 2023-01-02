import { NextApiRequest, NextApiResponse } from "next";
import { getCurrentContentsData } from "@/lib/utils/privyClient";

// make a call to privy to mark this address/groupId as claimed
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { groupId, address } = req.body;
  let status;
  try {
    // verify recipient and groupId with privy call
    const clubSpaceObject = await getCurrentContentsData(address as string, "clubspace-attendance");
    const record = clubSpaceObject.find((e) => e.groupId === groupId);
    if (!record) {
      status = 0;
    } else if (!record.claimed) {
      status = 1;
    } else if (record.claimed) {
      status = 2;
    }
    res.json({ status });
  } catch (error: any) {
    console.error(error);
    res.status(500).end();
  }
};

export default handler;
