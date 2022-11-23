export const APP_NAME = "Clubspace";

export const REDIS_SPACE_PREFIX = "space";
export const REDIS_STREAM_PREFIX = "stream";

// [seconds] 2hr exp for spaces; once the key is gone, the space has ended
export const REDIS_SPACE_EXP = 7200;

export const LOCALSTORAGE_DEFAULT_PROFILE_ID = "DEFAULT_PROFILE_ID";
export const SITE_URL = process.env.SITE_URL || "https://www.joinclubspace.xyz";
export const VERIFIER_ADDRESS = "0x5D7BdA4378aAAcB1760c74daF0d4a44e07e25f2A";
export const REWARD_NFT_ADDRESS = "0xA8116560Fb01A9d2889A43A3767b369a3256D1F7";

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
