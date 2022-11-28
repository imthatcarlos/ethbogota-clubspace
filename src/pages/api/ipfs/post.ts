import { NextApiRequest, NextApiResponse } from "next";
import { addJSON, addFile } from "@/services/storj/storj";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!req.body) return res.status(400).end();

    const ipfsHash = req.body.json
      ? await addJSON(req.body.json)
      : await addFile(req.body);

    return res.status(200).json({ ipfsHash });
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
};

export default handler;
