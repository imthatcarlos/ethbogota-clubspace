import { v4 as uuidv4 } from 'uuid';
import { useJam } from './jam-core-react';
import { ICreateSpace } from './types';
import { makeSemGroupIdHex } from './utils';

const createClubSpace = () => {
  const [, jamApi] = useJam();

  const create = async (spaceData: ICreateSpace, apiKey: string) => {
    const uuid = uuidv4();
    const ok = await jamApi.createRoom(uuid, { stageOnly: false });
    const res = await fetch(`https://www.joinclubspace.xyz/api/space/create`, {
      method: 'post',
      headers: {
        'x-api-key': apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clubSpaceId: uuid,
        semGroupIdHex: makeSemGroupIdHex(uuid),
        ...spaceData,
      }),
    });
    const {
      data: { url, semGroupIdHex },
    } = await res.json();

    return { res: ok, clubSpaceId: uuid, url, semGroupIdHex };
  };

  return { create };
};

export default createClubSpace;
