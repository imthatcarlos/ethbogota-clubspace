import { BigNumber } from 'ethers';

const APP_NAME = 'Clubspace';

export const makeSemGroupIdHex = (clubSpaceId: string) => {
  clubSpaceId = clubSpaceId.replace(/-/g, '');
  if (!clubSpaceId.startsWith('0x')) {
    // semaphore limitation
    clubSpaceId = `0x${clubSpaceId}`;
  }
  return clubSpaceId;
};

export const fieldNamePrivy = (semGroupIdHex: any) => {
  semGroupIdHex = makeSemGroupIdHex(semGroupIdHex);
  const id = BigNumber.from(semGroupIdHex).toString();
  return `${APP_NAME.toLowerCase()}-${id}`;
};
