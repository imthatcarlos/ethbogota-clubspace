import { apiUrls } from "@/constants/apiUrls";

export const getUrlForImageFromIpfs = (uri: string) => {
  const hash = uri.split("ipfs://")[1];
  return uri.startsWith("ipfs://") ? `${apiUrls.ipfs}/${hash}` : uri;
};
