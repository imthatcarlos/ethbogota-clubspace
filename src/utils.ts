import { apiUrls } from "@/constants/apiUrls";

export const getUrlForImageFromIpfs = (uri: string) => {
  if (!uri) return;
  const hash = uri.split("ipfs://")[1];
  return uri.startsWith("ipfs://") ? `${apiUrls.ipfs}/${hash}` : uri;
};

export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
