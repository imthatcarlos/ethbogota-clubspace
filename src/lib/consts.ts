export const APP_NAME = 'Clubspace'

// => array of lens handles with live spaces
export const REDIS_LIVE_SPACE_HANDLES = 'LIVE_SPACE_HANDLES';

// 1hr exp for spaces; once the key is gone, the space has ended
// NOTE: the key will remain in `REDIS_LIVE_SPACE_HANDLES` array, so we'll cross-ref and clean up
export const REDIS_SPACE_EXP = 3600;

export const UUID_NAMESPACE_URL = 'https://www.joinclubspace.xyz';
export const VERIFIER_ADDRESS = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
