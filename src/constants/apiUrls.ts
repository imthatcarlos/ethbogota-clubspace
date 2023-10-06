import { IS_PRODUCTION } from '../lib/consts';

export const apiUrls = {
  lensAPI: IS_PRODUCTION ? "https://api.lens.dev" : "https://api-mumbai.lens.dev",
  pinataGateway: "https://madfinance.mypinata.cloud/ipfs",
  ipfs: "https://ipfs.io/ipfs",
  soundxyz: "https://api.sound.xyz/graphql",
  lensGateway: "https://lens.infura-ipfs.io/ipfs",
};
