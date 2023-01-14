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
  semGroupIdHex = semGroupIdHex.toString();

  let id;

  if (semGroupIdHex.includes('-')) { // uuid
    id = semGroupIdHex;
  } else if (!semGroupIdHex.startsWith("0x")) { // semaphore limitation
    semGroupIdHex = `0x${semGroupIdHex}`;
    id = BigNumber.from(semGroupIdHex).toString();
  }

  return `${APP_NAME.toLowerCase()}-${id}`;
};
