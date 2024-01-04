import { env } from "@/env.mjs";
import { NextApiRequest, NextApiResponse } from "next";
import redisClient from "@/lib/utils/redisClient";

// HACK: using redis to manage our own permissions, reading in `/addUser` which seems to be called by livekit all the time :shrug:
export default async function muteParticipant(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, roomName, canPublish, spaceExp } = req.body;

    const permissionsKey = `perms/${roomName}/${name}`;

    // console.log(`overwriting redis perms at ${permissionsKey}`);
    // console.log(`canPublish: ${canPublish}`)
    if (canPublish) {
      await redisClient.set(permissionsKey, canPublish, "EX", spaceExp);
    } else {
      await redisClient.del(permissionsKey);
    }

    res.status(200).end();
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
}

// DEPRECATED...
// const url = `https://livepeer.studio/api/room/${roomName}/user/${identity}`;
// const response = await axios.put(
//   url,
//   {
//     canPublish: !canPublish,
//   },
//   {
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//     },
//   }
// );

// const result = await response.data;

// res.status(200).json(result);