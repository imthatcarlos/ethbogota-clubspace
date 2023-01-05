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
  if (!semGroupIdHex.startsWith("0x")) {
    semGroupIdHex = `0x${semGroupIdHex}`;
  }
  return `${APP_NAME.toLowerCase()}-${BigNumber.from(semGroupIdHex.toString()).toString()}`;
};
