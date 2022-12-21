import { chain } from '@decent.xyz/sdk';
import { IS_PRODUCTION } from '@/lib/consts';

export const chainIdToChain = {
  80001: chain.polygonMumbai,
  137: chain.polygon,
  1: chain.mainnet,
  5: chain.goerli,
  10: chain.optimism,
};

export const NFT_STORAGE_URL = 'https://nftstorage.link/ipfs';
export const DECENT_HQ = 'https://hq.decent.xyz';
export const DECENT_HQ_API = 'https://hq.decent.xyz/api';

export const CONTRACT_TYPE_CRESCENDO = 'DCNTCrescendo';
export const CONTRACT_TYPE_EDITION = 'DCNT721A';
export const CONTRACT_TYPE_ZK_EDITION = 'ZKEdition';
export const CONTRACT_TYPES_FOR_FEATURED = [CONTRACT_TYPE_EDITION, CONTRACT_TYPE_CRESCENDO];

export const DEFAULT_PARTY_FAVOR = '0xb2d816eca2b50d48bd632f74ef7cdbc2123f6c79'; // polygon
export const ZK_EDITION_CHAIN_ID = IS_PRODUCTION ? 137 : 80001; // for our semaphore contract

export const VIDEO_EXTENSIONS = [
	'3g2',
	'3gp',
	'aaf',
	'asf',
	'avchd',
	'avi',
	'drc',
	'flv',
	'm2v',
	'm3u8',
	'm4p',
	'm4v',
	'mkv',
	'mng',
	'mov',
	'mp2',
	'mp4',
	'mpe',
	'mpeg',
	'mpg',
	'mpv',
	'mxf',
	'nsv',
	'ogg',
	'ogv',
	'qt',
	'rm',
	'rmvb',
	'roq',
	'svi',
	'vob',
	'webm',
	'wmv',
	'yuv'
];
