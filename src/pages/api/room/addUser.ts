import { addUserReqValidator, addUserResValidator } from "@/lib/validators/api-room";
import axios from "axios";
import { env } from "@/env.mjs";
import { NextApiRequest, NextApiResponse } from "next";
import { TokenResult } from "@/lib/livekit/types";

const apiKey = env.LIVEPEER_API_KEY;

export default async function createRoom(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { roomName, identity, name, metadata } = addUserReqValidator.parse(req.query);

    const body = {
      name,
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

    try {
      const parsedMeta = JSON.parse(metadata);
      // @FIXME: remove this update request and do it on the first one when
      // it's supported to set the permissions
      console.log("parsedMeta", parsedMeta);
      if (parsedMeta && !parsedMeta["isHost"]) {
        const url = `https://livepeer.studio/api/room/${roomName}/user/${id}`;
        const response = await axios.put(
          url,
          {
            canPublish: false,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );

        console.log("permissions set");
      }
    } catch (err) {
      console.log("couldn't update permissions", err);
    }

    // {"id":"71d187fe-b74b-4fd9-988d-2f41b4f9a62e"}
    res.status(200).json(result);
  } catch (e) {
    res.statusMessage = (e as Error).message;
    res.status(500).end();
  }
}
