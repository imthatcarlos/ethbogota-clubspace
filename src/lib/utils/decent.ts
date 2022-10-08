import { DecentSDK, chain, crescendo } from "@decent.xyz/sdk";
import { Signer } from 'ethers';
import axios from 'axios';

const chainIdToChain = {
  80001: chain.polygonMumbai,
  137: chain.polygon
};

const NFT_STORAGE_URL = 'https://nftstorage.link/ipfs';

export const getContractData = async (address: string, chainId: number, signer: Signer) => {
  const sdk = new DecentSDK(chainIdToChain[chainId], signer);
  const myNFT = await crescendo.getContract(sdk, address);
  const uri = await myNFT.uri(1); // arg does not matter
  const hash = uri.split('ipfs://')[1];

  return await axios.get(`${NFT_STORAGE_URL}/${hash}`);
};
