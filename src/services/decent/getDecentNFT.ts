import { DecentSDK, chain, crescendo, edition } from "@decent.xyz/sdk";
import { Signer } from 'ethers';
import axios from 'axios';
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  chainIdToChain,
  NFT_STORAGE_URL,
  DECENT_HQ,
} from './utils';

export const CONTRACT_TYPE_CRESCENDO = 'crescendo';
export const CONTRACT_TYPE_EDITION = 'edition';
export const CONTRACT_TYPES_FOR_FEATURED = [CONTRACT_TYPE_EDITION, CONTRACT_TYPE_CRESCENDO];

export const getContractDataCrescendo = async (address: string, chainId: number, signer: Signer) => {
  const sdk = new DecentSDK(chainIdToChain[chainId], signer);

  try {
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
  } catch (error) {
    console.log(error);
  }
};

export const getContractDataEdition = async (address: string, chainId: number, signer: Signer) => {
  const sdk = new DecentSDK(chainIdToChain[chainId], signer);
  try {
    const contract = await edition.getContract(sdk, address);
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
      decentURL: `${DECENT_HQ}/${chainId}/Edition/${address}` // @TODO: need to test
    };
  } catch (error) {
    console.log(error);
  }
};

export const getContractData = async (address: string, chainId: number, signer: Signer, contractType: string) => {
  return contractType === CONTRACT_TYPE_CRESCENDO
    ? await getContractDataCrescendo(address, chainId, signer)
    : await getContractDataEdition(address, chainId, signer);
};

export const useGetContractData = (options: UseQueryOptions = {}, { address, chainId, signer, contractType }) => {
  const result = useQuery<Profile[]>(
    ["useGetContractData", address],
    async () => {
      const data = await getContractData(address, chainId, signer, contractType);
      data.contractType = contractType;

      return data;
    },
    {
      ...(options as any),
      enabled: !!(address && chainId && signer && contractType),
    }
  );

  return result;
};
