export const APP_NAME = "Clubspace";

// => array of lens handles with live spaces
export const REDIS_LIVE_SPACE_HANDLES = "LIVE_SPACE_HANDLES";

// 1hr exp for spaces; once the key is gone, the space has ended
// NOTE: the key will remain in `REDIS_LIVE_SPACE_HANDLES` array, so we'll cross-ref and clean up
export const REDIS_SPACE_EXP = 3600;

export const LOCALSTORAGE_DEFAULT_PROFILE_ID = "DEFAULT_PROFILE_ID";
export const UUID_NAMESPACE_URL = "https://www.joinclubspace.xyz";
export const VERIFIER_ADDRESS = "0xF32916569b2CD32f11F9d1bDa474A2C529A40831";
export const REWARD_NFT_ADDRESS = "0xf1f967DA26e3fae91653Fa1F91738C55F45bCD9b";

const calculateSum = (arr) => {
  return arr.reduce((total, current) => {
    return total + current;
  }, 0);
};

export const songTimes = [95, 227, 171, 121, 106, 177];
export const totalTime = calculateSum(songTimes);

export const STREAMR_PUBLIC_ID = process.env.NEXT_PUBLIC_STREAMR_STREAM_ID_PUBLIC ?? "";
