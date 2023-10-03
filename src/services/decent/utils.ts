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
export const DECENT_HQ_API = 'https://hq.decent.xyz/api/1.0';

export const CONTRACT_TYPE_CRESCENDO = 'DCNTCrescendo';
export const CONTRACT_TYPE_EDITION = 'DCNT721A';
export const CONTRACT_TYPE_ZK_EDITION = 'ZKEdition';
export const CONTRACT_TYPES_FOR_FEATURED = [CONTRACT_TYPE_EDITION, CONTRACT_TYPE_CRESCENDO];

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
