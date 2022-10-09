import { NextApiRequest, NextApiResponse } from "next";
import { getAddress } from "ethers/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { BigNumber } from "ethers";
import {PrivyClient} from '@privy-io/privy-node';
import redisClient from "@/lib/utils/redisClient";
import { REDIS_LIVE_SPACE_HANDLES, REDIS_SPACE_EXP, UUID_NAMESPACE_URL } from "@/lib/consts";

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
    } = req.body;

    if (
      !(
        creatorAddress &&
        creatorLensHandle &&
        creatorLensProfileId &&
        spinampPlaylistId &&
        decentContractAddress &&
        lensPubId
      )
    ) {
      return res.status(400).end({ error: "missing a param sonnn" });
    }

    const clubSpaceId = uuidv4();
    const parts = clubSpaceId.split("-");
    parts.pop();
    parts.pop();
    const semGroupIdHex = `0x${parts.join("")}`;
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
    };
    console.log(JSON.stringify(clubSpaceObject, null, 2));

    // stick it in redis
    try {
      console.log("setting redis");
      await redisClient.set(
        creatorLensHandle, // USING LENS HANDLE AS THE REDIS KEY!
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

    await client.createField({
      name: BigNumber.from(semGroupIdHex).toString(),
      description: `club space impressions for semaphone group id: ${semGroupIdHex}`,
      default_access_group: 'self-admin',
    });

    // shareable URL to join
    const url = `${UUID_NAMESPACE_URL}/live/${creatorLensHandle}`;

    return res.status(200).json({ url, semGroupIdHex });
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
};

export default handler;
