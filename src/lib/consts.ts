import { env } from "@/env.mjs";

export const IS_PRODUCTION = process.env.NEXT_PUBLIC_IS_PRODUCTION === "true";
export const APP_NAME = "Clubspace";

export const REDIS_SPACE_PREFIX = "space";
export const REDIS_STREAM_PREFIX = "stream";

// [seconds] 2hr exp for spaces; once the key is gone, the space has ended
export const REDIS_SPACE_EXP = 7200;

export const LOCALSTORAGE_DEFAULT_PROFILE_ID = "DEFAULT_PROFILE_ID";
export const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.joinclubspace.xyz";
export const LENSTER_URL = IS_PRODUCTION ? "https://lenster.xyz" : "https://testnet.lenster.xyz";

export const LENSHUB_PROXY = IS_PRODUCTION
  ? "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"
  : "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82";
export const FREE_COLLECT_MODULE = IS_PRODUCTION
  ? "0x23b9467334bEb345aAa6fd1545538F3d54436e96"
  : "0x0BE6bD7092ee83D44a6eC1D949626FeE48caB30c";

export const VERIFIER_ADDRESS = IS_PRODUCTION
  ? "0xd78722b20b3215975184e50519e5703163f7c7f4"
  : "0xD643ed715d367d63Eec28272c3ED70a755A1Dc70";

const calculateSum = (arr) => {
  return arr.reduce((total, current) => {
    return total + current;
  }, 0);
};

export const songTimes = [95, 227, 171, 121, 106, 177];
export const totalTime = calculateSum(songTimes);

export const STREAMR_PUBLIC_ID = process.env.NEXT_PUBLIC_STREAMR_STREAM_ID_PUBLIC ?? "";

export const ZK_DEPLOYMENT_BLOCK = 28522249;

export const SPACE_API_URL = env.NEXT_PUBLIC_SPACE_API_URL;

export const JSON_RPC_URL_POKT = IS_PRODUCTION
  ? process.env.NEXT_PUBLIC_POKT_RPC_POLYGON
  : process.env.NEXT_PUBLIC_POKT_RPC_MUMBAI;

export const JSON_RPC_URL_ALCHEMY = IS_PRODUCTION
  ? process.env.NEXT_PUBLIC_ALCHEMY_RPC_POLYGON
  : process.env.NEXT_PUBLIC_ALCHEMY_RPC_MUMBAI;

export const JSON_RPC_URL_ALCHEMY_MAP = {
  80001: process.env.NEXT_PUBLIC_ALCHEMY_RPC_MUMBAI,
  137: process.env.NEXT_PUBLIC_ALCHEMY_RPC_POLYGON,
  1: process.env.NEXT_PUBLIC_ALCHEMY_RPC_MAINNET,
  5: process.env.NEXT_PUBLIC_ALCHEMY_RPC_GOERLI,
  10: process.env.NEXT_PUBLIC_ALCHEMY_RPC_OPTIMISM,
};

export const CURRENCY_MAP = {
  80001: "MATIC (MUMBAI)",
  137: "MATIC",
  1: "ETH",
  5: "ETH (GOERLI)",
  10: "ETH (OPTIMISM)",
};

export const CHAIN_NAME_MAP = {
  80001: "Mumbai",
  137: "Polygon",
  1: "Ethereum",
  5: "Goerli",
  10: "Optimism",
};

export const ALLOWED_CHAIN_IDS = IS_PRODUCTION ? [137, 1, 10] : [80001, 5];

export const IM_WITH_THE_DJ = [
  "0x7F0408bc8Dfe90C09072D8ccF3a1C544737BcDB6",
  "0x6b500E03203Ae2D976C3d9ce0654DdCb39f998C4",
  "0xB408a9Ee6332477B143C8cfe6C2C8899849A2EDf",
  "0x5D7370fCD6e446bbC14A64c1EFfe5FBB1c893232",
  "0xA7d53695aF1FD11E0b75d37695290C102D59D743",
  "0x10795BE2b46fF958d126C257f300B725305E96Fe",
  "0x30dCCa068F593CbFFB5afFe8A89F35AE49614972", // zombie shepherd
  "0xB5bb48aF9510951FB869B34267b827e73f0Ab486",
  "0xF1c5bACc57b29bD704B768DE3389359dA00986E7",
  "0xc27773DD7e25D878C814fB238e5f7372F3a18A74",
  "0x64dC62CB349780064F4fe831d5DE5817dB819D95",
  "0x2954DbfBbDF8Dafd86c8DCaCe63b26796ef2bf52",
  "0x419090A6ebfa48e2B0be7118C5B8AB643808E710",
  "0x3585CA22dF80D70f6D1cC0867D8387c360181349",
];

export const GOOGLE_FORM_WAITLIST_URL = "https://w6iolkscuz1.typeform.com/to/DKIh7kV7";

export const DROP_PROTOCOL_DECENT = "DECENT_XYZ";
export const DROP_PROTOCOL_SOUND = "SOUND_XYZ";

export const TIER_OPEN = 'TIER_OPEN';
export const TIER_GATED_LENS_COLLECT = 'GATED_LENS_COLLECT';
export const CLUBSPACE_SERVICE_FEE_PCT = 20;
export const CLUBSPACE_SERVICE_FEE_RECIPIENT = '0x7F0408bc8Dfe90C09072D8ccF3a1C544737BcDB6';

export const LENS_COLLECT_PAYMENT_TOKENS = IS_PRODUCTION
  ? [
      { symbol: "USDC", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" },
      { symbol: "WMATIC", address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" },
    ]
  : [
      { symbol: "WMATIC", address: "0x9c3c9283d3e44854697cd22d3faa240cfb032889" },
    ];
