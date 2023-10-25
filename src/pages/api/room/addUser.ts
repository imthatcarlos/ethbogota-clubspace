import { addUserReqValidator, addUserResValidator } from "@/lib/validators/api-room";
import axios from "axios";
import { env } from "@/env.mjs";
import { NextApiRequest, NextApiResponse } from "next";
import { TokenResult } from "@/lib/livekit/types";

const apiKey = env.LIVEPEER_API_KEY;

export default async function addUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { roomName, identity, name, metadata, creatorAddress } = addUserReqValidator.parse(req.query);

    let canPublish = false;
    if (creatorAddress === identity) canPublish = true;

    const body = {
      name,
      canPublish,
      metadata,
    };
    const url = `https://livepeer.studio/api/room/${roomName}/user`;
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    // token, id and joinURL
    const { token, id } = addUserResValidator.parse(await response.data);

    const result: TokenResult = {
      identity: identity as string,
      accessToken: token,
    };

    // {"id":"71d187fe-b74b-4fd9-988d-2f41b4f9a62e"}
    res.status(200).json(result);
  } catch (e) {
    res.statusMessage = (e as Error).message;
    res.status(500).end();
  }
}
