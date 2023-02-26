import { v4 as uuidv4 } from 'uuid';
import { API_URL } from './consts';
import { useJam } from './jam-core-react';
import { ICreateSpace } from './types';

const createClubSpace = () => {
  const [, jamApi] = useJam();

  const create = async (spaceData: ICreateSpace, apiKey: string) => {
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
