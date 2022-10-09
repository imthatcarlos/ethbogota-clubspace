import { sendNotification } from "@/services/push/push";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { url } = req.body;
  console.log('sending notification for url', url)
  
  try {
    await sendNotification(url);

    res.status(200).end();
  } catch (error: any) {
    console.error(error);

    res.status(500).end();
  }
};

export default handler;
