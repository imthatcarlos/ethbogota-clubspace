import { v4 as uuidv4 } from 'uuid';
import { Signer } from 'ethers';
import { API_URL, ETHERS_SIGN_MESSAGE } from './consts';
import { useJam } from './jam-core-react';
import { ICreateSpace, ILensProfile } from './types';

const _validateLensOwnership = async (signer: Signer, profile: ILensProfile) => {
  // @TODO: something better?
  await signer.signMessage(ETHERS_SIGN_MESSAGE);
  const address = await signer.getAddress();

  if (profile.ownedBy !== address) {
    throw new Error(`Not profile owner! Expected ${profile.ownedBy} == ${address}`);
  }
}

const createClubSpace = () => {
  const [, jamApi] = useJam();

  const create = async (
    spaceData: ICreateSpace,
    apiKey: string,
    signer: Signer,
    profile: ILensProfile,
  ) => {
    await _validateLensOwnership(signer, profile);

    const uuid = uuidv4();
    const ok = await jamApi.createRoom(uuid);
    const res = await fetch(`${API_URL}/space/create`, {
      method: 'post',
      headers: {
        'x-api-key': apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clubSpaceObject: {
          clubSpaceId: uuid,
          ...spaceData,
          creatorAddress: profile.ownedBy,
          creatorLensHandle: profile.handle,
          creatorLensProfileId: profile.id,
          handle: profile.handle,
        }
      }),
    });
    const { data } = await res.json();

    return {
      res: ok,
      clubSpaceId: uuid,
      url: data.url,
      semGroupIdHex: data.semGroupIdHex,
    };
  };

  return { create };
};

export default createClubSpace;
