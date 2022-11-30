export const IS_PRODUCTION = process.env.NEXT_PUBLIC_IS_PRODUCTION || false;
export const APP_NAME = "Clubspace";

export const REDIS_SPACE_PREFIX = "space";
export const REDIS_STREAM_PREFIX = "stream";

// [seconds] 2hr exp for spaces; once the key is gone, the space has ended
export const REDIS_SPACE_EXP = 7200;

export const LOCALSTORAGE_DEFAULT_PROFILE_ID = "DEFAULT_PROFILE_ID";
export const SITE_URL = process.env.SITE_URL || "https://www.joinclubspace.xyz";
export const LENSTER_URL = IS_PRODUCTION ? 'https://lenster.xyz' : 'https://testnet.lenster.xyz';

export const VERIFIER_ADDRESS = IS_PRODUCTION
  ? "0x41c976200df8f14aF5422597A5A346e95b0A3E77"
  : "0x3CCb6b215Dd6ad75a4DDf6121D06230dC6554840";

const calculateSum = (arr) => {
  return arr.reduce((total, current) => {
    return total + current;
  }, 0);
};

export const songTimes = [95, 227, 171, 121, 106, 177];
export const totalTime = calculateSum(songTimes);

export const STREAMR_PUBLIC_ID = process.env.NEXT_PUBLIC_STREAMR_STREAM_ID_PUBLIC ?? "";

export const ZK_DEPLOYMENT_BLOCK = 28522249;

export const SPACE_API_URL = process.env.NEXT_PUBLIC_SPACE_API_URL;

export const JSON_RPC_URL_POKT = IS_PRODUCTION
  ? process.env.NEXT_PUBLIC_POKT_RPC_POLYGON
  : process.env.NEXT_PUBLIC_POKT_RPC_MUMBAI;
