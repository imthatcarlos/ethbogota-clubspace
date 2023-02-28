import { NextApiRequest, NextApiResponse } from "next";
import { getAddress } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { PrivyClient } from "@privy-io/privy-node";
import redisClient from "@/lib/utils/redisClient";
import { REDIS_SPACE_PREFIX, REDIS_SPACE_EXP, NEXT_PUBLIC_SITE_URL, APP_NAME } from "@/lib/consts";
import { startRadio } from "@/services/radio";
import { fieldNamePrivy } from "@/utils";
import Cors from "cors";

const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});

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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, cors);

  // write club space object to redis for lookup
  try {
    const {
      creatorAddress,
      creatorLensHandle,
      creatorLensProfileId,
      spinampPlaylistId,
      drop,
      lensPubId,
      handle,
      clubSpaceId,
      partyFavorContractAddress,
      startAt, // ts UTC
      productBannerUrl,
      productBannerIsVideo,
      pinnedLensPost,
    } = req.body;

    if (!(creatorAddress && handle && spinampPlaylistId && (drop || pinnedLensPost) && clubSpaceId)) {
      return res.status(400).json({ error: "missing a param sonnn" });
    }

    const semGroupIdHex = `0x${clubSpaceId.replace(/-/g, "")}`;
    const createdAt = Math.floor(Date.now() / 1000);
    const endAt = createdAt + REDIS_SPACE_EXP;

    const clubSpaceObject = {
      creatorAddress: getAddress(creatorAddress),
      creatorLensHandle,
      creatorLensProfileId,
      lensPubId,
      spinampPlaylistId,
      drop,
      clubSpaceId,
      createdAt,
      endAt,
      semGroupIdHex,
      handle,
      partyFavorContractAddress,
      startAt,
      productBannerUrl,
      productBannerIsVideo,
      pinnedLensPost,
    };
    console.log(JSON.stringify(clubSpaceObject, null, 2));
    const spaceRedisKey = `${REDIS_SPACE_PREFIX}/${handle}`;

    // stick it in redis
    const exp = startAt ? startAt - Math.floor(Date.now() / 1000) + REDIS_SPACE_EXP : REDIS_SPACE_EXP;
    try {
      console.log("setting redis");
      await redisClient.set(spaceRedisKey, JSON.stringify(clubSpaceObject), "EX", exp);
      console.log("set!");
    } catch (error) {
      console.log(error.stack);
    }

    // create privy field for impressions
    const client = new PrivyClient(process.env.PRIVY_API_KEY, process.env.PRIVY_API_SECRET);

    const fieldName = fieldNamePrivy(semGroupIdHex);
    try {
      await client.createField({
        name: fieldName,
        description: `club space impressions for semaphore group id: ${semGroupIdHex}`,
        default_access_group: "self-admin",
      });
    } catch (error) {
      // only happening if field already exits, won't happen unless creating test ones
      // console.log(error);
      console.log("ERROR - privy field exists");
    }

    // post the playlist id for our api to create the audio stream async;
    // if startAt != undefined, it means this space should be scheduled
    await startRadio({ clubSpaceId, spinampPlaylistId, spaceRedisKey, startAt });

    return res.status(200).json({ url: `${NEXT_PUBLIC_SITE_URL}/live/${handle}`, semGroupIdHex, startAt });
  } catch (e) {
    console.log(e);
    return res.status(500).json({});
  }
};

export default handler;
