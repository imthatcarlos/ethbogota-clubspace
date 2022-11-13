import { NextApiRequest, NextApiResponse } from "next";
import { getAddress } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import {PrivyClient} from '@privy-io/privy-node';
import redisClient from "@/lib/utils/redisClient";
import { REDIS_LIVE_SPACE_HANDLES, REDIS_SPACE_EXP, SITE_URL } from "@/lib/consts";
import { startRadio } from "@/services/radio";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // write club space object to redis for lookup
  try {
    const {
      creatorAddress,
      creatorLensHandle,
      creatorLensProfileId,
      spinampPlaylistId,
      decentContractAddress, // mumbai
      decentContractChainId, // 80001
      lensPubId,
      handle,
      clubSpaceId,
    } = req.body;

    if (
      !(
        creatorAddress &&
        handle &&
        spinampPlaylistId &&
        decentContractAddress &&
        clubSpaceId
      )
    ) {
      return res.status(400).json({ error: "missing a param sonnn" });
    }

    const semGroupIdHex = `0x${clubSpaceId}`;
    const createdAt = Date.now();
    const endAt = Math.floor(Date.now() / 1000) + REDIS_SPACE_EXP;

    const clubSpaceObject = {
      creatorAddress: getAddress(creatorAddress),
      creatorLensHandle,
      creatorLensProfileId,
      lensPubId,
      spinampPlaylistId,
      decentContractAddress,
      clubSpaceId,
      createdAt,
      endAt,
      semGroupIdHex,
      handle,
    };
    console.log(JSON.stringify(clubSpaceObject, null, 2));

    // stick it in redis
    try {
      console.log("setting redis");
      await redisClient.set(
        handle,
        JSON.stringify(clubSpaceObject),
        "EX",
        REDIS_SPACE_EXP
      );
      console.log("set!");
    } catch (error) {
      console.log(error.stack);
    }

    // create privy field for impressions
    const client = new PrivyClient(process.env.PRIVY_API_KEY, process.env.PRIVY_API_SECRET);

    try {
      await client.createField({
        name: BigNumber.from(semGroupIdHex).toString(),
        description: `club space impressions for semaphone group id: ${semGroupIdHex}`,
        default_access_group: 'self-admin',
      });
    } catch (error) {
      // only happening if field already exits, won't happen unless creating test ones
      // console.log(error);
      console.log('ERROR - privy field exists');
    }

    // post the playlist id for our api to create the audio stream async; will be written to redis
    await startRadio({ clubSpaceId, spinampPlaylistId });

    return res
      .status(200)
      .json({ url: `${SITE_URL}/live/${handle}`, semGroupIdHex });
  } catch (e) {
    console.log(e);
    return res.status(500).json({});
  }
};

export default handler;
