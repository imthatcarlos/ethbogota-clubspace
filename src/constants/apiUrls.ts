import { IS_PRODUCTION } from '../lib/consts';

const MADFI_TESTNET_SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/mad-finance/testnet-madfi-subgraph";
// using creator-portal api key
const MADFI_SUBGRAPH_URL = "https://gateway-arbitrum.network.thegraph.com/api/f20f599ac26b8e94d695abe3977b4a78/subgraphs/id/BT7yTf18FbLQpbZ35k9sTnQ8PVNEjG3QgbsggCMnC6oU";

export const apiUrls = {
  lensAPI: IS_PRODUCTION ? "https://api-v2.lens.dev" : "https://api-v2-mumbai.lens.dev",
  pinataGateway: "https://madfinance.mypinata.cloud/ipfs",
  ipfs: "https://ipfs.io/ipfs",
  soundxyz: "https://api.sound.xyz/graphql",
  lensGateway: "https://lens.infura-ipfs.io/ipfs",
  madfiSubgraph: IS_PRODUCTION ? MADFI_SUBGRAPH_URL : MADFI_TESTNET_SUBGRAPH_URL,
};
