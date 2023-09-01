import { env } from "@/env.mjs";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const url = "https://livepeer.studio/api/room";
const body = {};

const apiKey = env.LIVEPEER_API_KEY;

export default async function createRoom(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const result = await response.data;

    // {"id":"71d187fe-b74b-4fd9-988d-2f41b4f9a62e"}
    res.status(200).json(result);
  } catch (e) {
    res.statusMessage = (e as Error).message;
    res.status(500).end();
  }
}
