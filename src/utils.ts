import { apiUrls } from "@/constants/apiUrls";
import { BigNumber } from "ethers";
import { APP_NAME } from "./lib/consts";

export const getUrlForImageFromIpfs = (uri: string) => {
  if (!uri) return;
  const hash = uri.split("ipfs://")[1];
  return uri.startsWith("ipfs://") ? `${apiUrls.ipfs}/${hash}` : uri;
};

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fieldNamePrivy = (semGroupIdHex: any) => {
  semGroupIdHex = semGroupIdHex.toString().replace(/-/g, '');

  let id;

  if (!semGroupIdHex.startsWith("0x")) { // semaphore limitation
    semGroupIdHex = `0x${semGroupIdHex}`;
  }
  id = BigNumber.from(semGroupIdHex).toString();

  // console.log('privy ID:', `${APP_NAME.toLowerCase()}-${id}`);

  return `${APP_NAME.toLowerCase()}-${id}`;
};

export const kFormatter = (num) => {
  if (typeof num === 'string') return num;

  if (Math.abs(num) > 999_999) {
    return Math.sign(num)*((Math.abs(num)/1_000_000).toFixed(1)) + 'mil';
  } else if (Math.abs(num) > 999) {
    return Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k';
  }

  return Math.sign(num)*Math.abs(num);
};
