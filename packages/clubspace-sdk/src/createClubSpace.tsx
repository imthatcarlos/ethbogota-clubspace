import { v4 as uuidv4 } from 'uuid';
import { SITE_URL } from './consts';
import { useJam } from './jam-core-react';
import { ICreateSpace } from './types';

const createClubSpace = () => {
  const [, jamApi] = useJam();

  const create = async (spaceData: ICreateSpace, apiKey: string) => {
    const uuid = uuidv4();
    const ok = await jamApi.createRoom(uuid);
    console.log('jam room created', ok);
    const res = await fetch(`${SITE_URL}/space/create`, {
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
        },
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
