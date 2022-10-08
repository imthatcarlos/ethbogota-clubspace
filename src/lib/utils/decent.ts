import { DecentSDK, chain, crescendo } from "@decent.xyz/sdk";
import { Signer } from 'ethers';

const chainIdToChain = {
  80001: chain.polygonMumbai,
  137: chain.polygon
};

export const getContractData = async (address: string, chainId: number, signer: Signer) => {
  const sdk = new DecentSDK(chainIdToChain[chainId], signer);
  const myNFT = await crescendo.getContract(sdk, address);
  console.log(myNFT);
};
