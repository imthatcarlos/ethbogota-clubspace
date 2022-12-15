export const IS_PRODUCTION = process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true';
export const APP_NAME = "Clubspace";

export const REDIS_SPACE_PREFIX = "space";
export const REDIS_STREAM_PREFIX = "stream";

// [seconds] 2hr exp for spaces; once the key is gone, the space has ended
export const REDIS_SPACE_EXP = 7200;

export const LOCALSTORAGE_DEFAULT_PROFILE_ID = "DEFAULT_PROFILE_ID";
export const SITE_URL = process.env.SITE_URL || "https://www.joinclubspace.xyz";
export const LENSTER_URL = IS_PRODUCTION ? 'https://lenster.xyz' : 'https://testnet.lenster.xyz';

export const LENSHUB_PROXY = IS_PRODUCTION
  ? "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d"
  : "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82";
export const FREE_COLLECT_MODULE = IS_PRODUCTION
  ? "0x23b9467334bEb345aAa6fd1545538F3d54436e96"
  : "0x0BE6bD7092ee83D44a6eC1D949626FeE48caB30c";

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

export const JSON_RPC_URL_ALCHEMY = IS_PRODUCTION
  ? process.env.NEXT_PUBLIC_ALCHEMY_RPC_POLYGON
  : process.env.NEXT_PUBLIC_ALCHEMY_RPC_MUMBAI;

export const IM_WITH_THE_DJ = [
  '0x7F0408bc8Dfe90C09072D8ccF3a1C544737BcDB6',
  '0x6b500E03203Ae2D976C3d9ce0654DdCb39f998C4',
  '0xB408a9Ee6332477B143C8cfe6C2C8899849A2EDf',
  '0x5D7370fCD6e446bbC14A64c1EFfe5FBB1c893232',
  '0xA7d53695aF1FD11E0b75d37695290C102D59D743',
  '0x10795BE2b46fF958d126C257f300B725305E96Fe'
];

export const GOOGLE_FORM_WAITLIST_URL = 'https://forms.gle/XEU44w1gHt3LTC9A7';
