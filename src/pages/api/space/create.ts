import { NextApiRequest, NextApiResponse } from "next";
import { getAddress } from "ethers/lib/utils";
import { v5 as uuidv5 } from 'uuid';
import redisClient from '@/lib/utils/redisClient';
import {
  REDIS_LIVE_SPACE_HANDLES,
  REDIS_SPACE_EXP,
  UUID_NAMESPACE_URL,
} from '@/lib/consts.ts';

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

    if (!(creatorAddress
      && creatorLensHandle
      && creatorLensProfileId
      && spinampPlaylistId
      && decentContractAddress
      && lensPubId)) {
      return res.status(400).end({ error: 'missing a param sonnn' });
    }

    const {
      REDIS_HOST,
      REDIS_PORT,
      REDIS_PASSWORD
    } = process.env;

    const clubSpaceId = uuidv5(UUID_NAMESPACE_URL, uuidv5.URL);
    const semGroupIdHex = `0x${clubSpaceId.split('-').join('')}`;
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
      console.log('setting redis');
      await redisClient.set(
        creatorLensHandle, // USING LENS HANDLE AS THE REDIS KEY!
        JSON.stringify(clubSpaceObject),
        'EX',
        REDIS_SPACE_EXP
      );
      console.log('set!');
    } catch (error) {
      console.log(error.stack);
    }

    // shareable URL to join
    const url = `${UUID_NAMESPACE_URL}/live/${creatorLensHandle}`;

    return res.status(200).json({ url, semGroupIdHex });
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
}

export default handler;
