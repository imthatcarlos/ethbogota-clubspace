import { env } from "@/env.mjs";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const apiKey = env.LIVEPEER_API_KEY;

export default async function muteParticipant(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { identity, roomName, canPublish } = req.body;

    const url = `https://livepeer.studio/api/room/${roomName}/user/${identity}`;
    const response = await axios.put(
      url,
      {
        canPublish: !canPublish,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const result = await response.data;
    console.log("result", result);

    // {"id":"71d187fe-b74b-4fd9-988d-2f41b4f9a62e"}
    res.status(200).json(result);
  } catch (e) {
    res.statusMessage = (e as Error).message;
    res.status(500).end();
  }
}
