import { BigNumber } from 'ethers';

const APP_NAME = 'Clubspace';

export const fieldNamePrivy = (semGroupIdHex: any) => {
  semGroupIdHex = semGroupIdHex.toString().replace(/-/g, '');
  if (!semGroupIdHex.startsWith('0x')) {
    // semaphore limitation
    semGroupIdHex = `0x${semGroupIdHex}`;
  }
  const id = BigNumber.from(semGroupIdHex).toString();
  return `${APP_NAME.toLowerCase()}-${id}`;
};
