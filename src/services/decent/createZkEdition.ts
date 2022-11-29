import { DecentSDK, zkEdition } from "@decent.xyz/sdk";
import { Signer } from 'ethers';
import {
  chainIdToChain,
  NFT_STORAGE_URL,
  DECENT_HQ,
} from './utils';
import { VERIFIER_ADDRESS } from '@/lib/consts';

export const CONTRACT_TYPE_ZK_EDITION = 'zkEdition';

const DEFAULT_MAX_TOKENS = 100000000; // 100mil
const DEFAULT_TOKEN_PRICE = '0';
const DEFAULT_MAX_TOKEN_PURCHASE = 1;
const DEFAULT_MAX_ROYALTY_BPS = 1000; // 10%

type CreateProps = {
  handle: string;
  chainId: number;
  signer: Signer;
  name: string;
  symbol?: string;
  uri: string;
};

export default async ({
  handle,
  chainId,
  signer,
  name,
  symbol = `CLUB-${handle}`,
  uri,
}: CreateProps) => {
  const sdk = new DecentSDK(chainIdToChain[chainId], signer);

  const myNFT = await zkEdition.deploy(
    sdk,
    name,
    symbol,
    DEFAULT_MAX_TOKENS,
    DEFAULT_TOKEN_PRICE,
    DEFAULT_MAX_TOKEN_PURCHASE,
    DEFAULT_MAX_ROYALTY_BPS,
    uri,
    null, // MetadataRendererInit
    VERIFIER_ADDRESS // @TODO: not sure it will be here or before metadata config
    // onTxPending,
    // onTxReceipt
  );

  return myNFT.address;
};
