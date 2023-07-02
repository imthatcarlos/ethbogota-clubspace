import { addUserReqValidator, addUserResValidator } from "@/lib/validators/api-room";
import axios from "axios";
import { env } from "@/env.mjs";
import { NextApiRequest, NextApiResponse } from "next";
import { TokenResult } from "@/lib/livekit/types";

const apiKey = env.LIVEPEER_API_KEY;

export default async function createRoom(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { roomName, identity, name, metadata } = addUserReqValidator.parse(req.query);

    // console.log("called", roomName, identity, name, metadata);

    let canPublish = false;
    try {
      // @TODO: validate server side if the user is the host based on clubSpaceObject to send correct metadata
      // signing works and adds an extra layer of security, but it's also an extra step for the host to join.
      const parsedMeta = JSON.parse(metadata);
      if (parsedMeta && parsedMeta["isHost"]) {
        canPublish = true;
      }
    } catch (err) {
      console.log("failed to parse metadata...", err);
      canPublish = false;
    }

    const body = {
      name,
      canPublish,
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
