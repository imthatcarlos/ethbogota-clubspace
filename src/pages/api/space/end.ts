import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { Livepeer } from "livepeer";

import { env } from "@/env.mjs";
import redisClient from "@/lib/utils/redisClient";
import { REDIS_SPACE_PREFIX, LIVEPEER_STUDIO_API } from "@/lib/consts";

const { LIVEPEER_API_KEY } = env;

// this api endpoint is only ever called from `madfi.xyz` or the clubspace-sdk
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { space } = req.body;
    const spaceRedisKey = `${REDIS_SPACE_PREFIX}/${space.handle}`;

    // delete livepeer room
    console.log(`deleting livepeer room: ${space.roomId}`);
    await axios.delete(`${LIVEPEER_STUDIO_API}/room/${space.roomId}`, {
      headers: { Authorization: `Bearer ${LIVEPEER_API_KEY}` },
    });

    // terminate stream
    const livepeer = new Livepeer({ apiKey: LIVEPEER_API_KEY });
    livepeer.stream.terminate(space.streamId);
    livepeer.stream.update(space.streamId, { suspended: true });

    // remove from redis
    await redisClient.del(spaceRedisKey);

    res.status(200).end();
  } catch (e) {
    console.log(e);

    res.status(500).end();
  }
};

export default handler;
