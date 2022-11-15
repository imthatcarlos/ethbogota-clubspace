import { DecentSDK, chain, crescendo } from "@decent.xyz/sdk";
import { Signer } from 'ethers';
import axios from 'axios';
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

const chainIdToChain = {
  80001: chain.polygonMumbai,
  137: chain.polygon
};

const NFT_STORAGE_URL = 'https://nftstorage.link/ipfs';
const DECENT_HQ = 'https://hq.decent.xyz';

export const getContractDataCrescendo = async (address: string, chainId: number, signer: Signer) => {
  const sdk = new DecentSDK(chainIdToChain[chainId], signer);
  const contract = await crescendo.getContract(sdk, address);
  const [uri, price, totalSupply, saleIsActive] = await Promise.all([
    contract.uri(1),
    contract.calculateCurvedMintReturn(1, 0),
    contract.totalSupply(0),
    contract.saleIsActive()
  ]);

  const { data } = await axios.get(`${NFT_STORAGE_URL}/${uri.split('ipfs://')[1]}`);

  return {
    contract,
    metadata: data,
    price,
    totalSupply,
    saleIsActive,
    decentURL: `${DECENT_HQ}/${chainId}/Crescendo/${address}`
  };
};

export const getContractDataEdition = async (address: string, chainId: number, signer: Signer) => {
  const sdk = new DecentSDK(chainIdToChain[chainId], signer);
  const contract = await crescendo.getContract(sdk, address);
  const [uri, price, totalSupply, availableSupply, saleIsActive] = await Promise.all([
    contract.tokenURI(1),
    contract.tokenPrice(),
    contract.totalSupply(),
    contract.MAX_TOKENS(),
    contract.saleIsActive()
  ]);

  const { data } = await axios.get(`${NFT_STORAGE_URL}/${uri.split('ipfs://')[1]}`);

  return {
    contract,
    metadata: data,
    price,
    totalSupply,
    availableSupply,
    saleIsActive,
    decentURL: `${DECENT_HQ}/${chainId}/Edition/${address}` // need to test
  };
};

// @TODO: flip based on a param
export const getContractData = async (address: string, chainId: number, signer: Signer) => {
  return await getContractDataCrescendo(address, chainId, signer);
  // return await getContractDataEdition(address, chainId, signer);
};

export const useGetContractData = (options: UseQueryOptions = {}, { address, chainId, signer }) => {
  const result = useQuery<Profile[]>(
    ["useGetContractData", address],
    async () => {
      return await getContractData(address, chainId, signer);
    },
    {
      ...(options as any),
      enabled: !!(address && chainId && signer),
    }
  );

  return result;
};
