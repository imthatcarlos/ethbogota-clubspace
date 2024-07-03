import Cors from "cors";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { Livepeer } from "livepeer";
import { getAddress } from "ethers/lib/utils";
import { MongoClient } from "mongodb";
import { env } from "@/env.mjs";
import redisClient from "@/lib/utils/redisClient";
import {
  REDIS_SPACE_PREFIX,
  REDIS_SPACE_EXP,
  NEXT_PUBLIC_SITE_URL,
  LIVEPEER_STUDIO_API,
} from "@/lib/consts";

const cors = Cors({
  methods: ["HEAD", "POST", "GET"],
});

const {
  SPACE_API_BEARER,
  LIVEPEER_API_KEY,
  MADFI_API_KEY,
} = env;

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
};

// check bearer
const checkAuthorization = (req: NextApiRequest): boolean => {
  const authHeader = req.headers.authorization;
  const expectedAuthHeader = `Bearer ${process.env.SPACE_API_BEARER}`;

  if (authHeader !== expectedAuthHeader) {
    return false;
  }

  return true;
};

const createMongoRecord = async (redisKey, space) => {
  const client = new MongoClient(process.env.TIPS_MONGO_URI!);
  await client.connect();
  const database = client.db("madfi");
  const collection = database.collection("spaces");
  await collection.insertOne({
    redisKey,
    roomName: space.roomName,
    roomId: space.roomId,
    streamId: space.streamId,
    playbackId: space.playbackId,
    creatorLensProfileId: space.creatorLensProfileId,
    endAt: space.endAt,
    enableRecording: space.enableRecording,
    createdAt: space.createdAt
  });
};

// this api endpoint is only ever called from `madfi.xyz` or the clubspace-sdk
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await runMiddleware(req, res, cors); // enable CORS

    if (!checkAuthorization(req)) return res.status(403).json({ error: "forbidden" });

    const {
      creatorAddress,
      creatorLensHandle,
      creatorLensProfileId,
      creatorAvatar,
      // spinampPlaylistId,
      // b2bSpinampPlaylistIds,
      drop,
      lensPubId,
      handle,
      // partyFavorContractAddress,
      startAt, // ts UTC
      productBannerUrl,
      productBannerIsVideo,
      pinnedLensPost,
      gated,
      spaceType,
      roomName,
      enableRecording,
      tipPubId,
      invitedHandles,
    } = req.body;

    if (!(creatorAddress && handle)) {
      return res.status(400).json({ error: "missing creatorAddress or handle" });
    }

    const { data: { id: roomId } } = await axios.post(`${LIVEPEER_STUDIO_API}/room`, {}, {
      headers: { Authorization: `Bearer ${LIVEPEER_API_KEY}` },
    });

    const livepeer = new Livepeer({ apiKey: LIVEPEER_API_KEY });
    const { stream: { id: streamId, playbackId } }
      = await livepeer.stream.create({ name: roomId, record: true });
    await livepeer.room.startEgress(roomId, { streamId });
    const playbackURL = `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`;

    const createdAt = Math.floor(Date.now() / 1000);
    const endAt = createdAt + REDIS_SPACE_EXP;

    const spaceObject = {
      roomName,
      creatorAddress: getAddress(creatorAddress),
      creatorLensHandle,
      creatorLensProfileId,
      creatorAvatar,
      lensPubId,
      drop,
      roomId,
      streamId,
      playbackId,
      playbackURL,
      createdAt,
      endAt,
      handle,
      startAt,
      productBannerUrl,
      productBannerIsVideo,
      pinnedLensPost,
      gated,
      spaceType,
      tipPubId,
      exp: startAt ? startAt - createdAt + REDIS_SPACE_EXP : REDIS_SPACE_EXP
    };

    const spaceRedisKey = `${REDIS_SPACE_PREFIX}/${handle}`;

    try {
      console.log(`setting in redis [${spaceRedisKey}] with exp at ${endAt}`);
      console.log(JSON.stringify(spaceObject, null, 2));
      await redisClient.set(spaceRedisKey, JSON.stringify(spaceObject), "EX", spaceObject.exp);
    } catch (error) {
      console.log(error.stack);
    }

    if (!!invitedHandles) {
      await Promise.all(invitedHandles.split(",").map(async(invitedHandle: string) => {
        const permissionsKey = `perms/${roomId}/${invitedHandle}`;
        await redisClient.set(permissionsKey, true, "EX", spaceObject.exp);
      }));
    }

    await createMongoRecord(spaceRedisKey, spaceObject);

    // TODO: fix
    // // schedule the lambda to delete at `endAt`
    // const scheduleParams = { roomId, lambda: 'livepeer_delete_room', scheduleAtTs: spaceObject.endAt };
    // await axios.post(`${MADFI_API_URL}/schedule`, scheduleParams, {
    //   headers: { 'x-api-key': MADFI_API_KEY },
    // });

    return res.status(200).json({ url: `${NEXT_PUBLIC_SITE_URL}/${handle}`, startAt, endAt, playbackURL });
  } catch (e) {
    console.log(e);

    if (!res.writableEnded) {
      return res.status(500).json({});
    }

    res.end();
  }
};

export default handler;
