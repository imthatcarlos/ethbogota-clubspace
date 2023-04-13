import { DecentSDK, zkEdition } from "@decent.xyz/sdk";
import { Signer, ethers } from "ethers";
import { chainIdToChain, NFT_STORAGE_URL, DECENT_HQ } from "./utils";
import { VERIFIER_ADDRESS } from "@/lib/consts";

const DEFAULT_MAX_TOKENS = 10000; // 10k
const DEFAULT_TOKEN_PRICE = "0";
const DEFAULT_MAX_TOKEN_PURCHASE = 1;
const DEFAULT_MAX_ROYALTY_BPS = 1000; // 10%
const DEFAULT_HAS_ADJUSTABLE_CAP = true;
const DEFAULT_CONTRACT_URI = "ipfs://QmcWWei8y8B4CU4K8Q7Ef4QmsgP6TkRewcZBUj1c84Tto4";
const DEFAULT_PAYOUT_ADDRESS = "0x7F0408bc8Dfe90C09072D8ccF3a1C544737BcDB6";

type CreateProps = {
  handle: string;
  chainId: number;
  signer: Signer;
  name: string;
  symbol?: string;
  uri: string;
};

export default async ({ handle, chainId, signer, name, symbol = `CLUB-${handle}`, uri }: CreateProps) => {
  try {
    const sdk = new DecentSDK(chainIdToChain[chainId], signer);

    const myNFT = await zkEdition.deploy(
      sdk,
      name,
      symbol,
      DEFAULT_HAS_ADJUSTABLE_CAP,
      false, // isSoulbound
      DEFAULT_MAX_TOKENS,
      ethers.BigNumber.from(DEFAULT_TOKEN_PRICE),
      DEFAULT_MAX_TOKEN_PURCHASE,
      null, // presaleMerkleRoot
      0, // presaleStart
      0, // presaleEnd
      0, // saleStart
      0, // saleEnd
      DEFAULT_MAX_ROYALTY_BPS,
      DEFAULT_PAYOUT_ADDRESS,
      DEFAULT_CONTRACT_URI, // @TODO: this should be custom per collection
      uri,
      null, // MetadataRendererInit
      null, // TokenGateConfig
      VERIFIER_ADDRESS
      // onTxPending,
      // onTxReceipt
      // parentIP
    );

    return myNFT.address;
  } catch (error) {
    console.log(error);
  }
};
