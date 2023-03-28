import { DecentSDK, chain, crescendo, edition, zkEdition, metadataRenderer } from "@decent.xyz/sdk";
import { Signer, providers } from 'ethers';
import axios from 'axios';
import { last } from 'lodash/array';
import {
  chainIdToChain,
  NFT_STORAGE_URL,
  DECENT_HQ,
  CONTRACT_TYPE_CRESCENDO,
  CONTRACT_TYPE_EDITION,
  CONTRACT_TYPE_ZK_EDITION,
  VIDEO_EXTENSIONS,
} from './utils';
import { JSON_RPC_URL_ALCHEMY_MAP } from "@/lib/consts";

const defaultProvider = (chainId) => new providers.JsonRpcProvider(JSON_RPC_URL_ALCHEMY_MAP[chainId]);

const _getMetadata = async (sdk: any, contract: any, contractType: string) => {
  let uri;

  try {
    if (contractType === CONTRACT_TYPE_CRESCENDO) {
      uri = await contract.uri(1);
    } else if (contractType === CONTRACT_TYPE_EDITION) {
      uri = await contract.baseURI();
    } else if (contractType === CONTRACT_TYPE_ZK_EDITION) {
      uri = await contract.baseURI();
    }
  } catch {} // some revert

  // try the metadata renderer
  if (!uri) {
    const renderer = await metadataRenderer.getContract(sdk);
    uri = await renderer.tokenURITarget(0, contract.address);
  }

  let metadata;
  if (uri.startsWith('ipfs://')) {
    const res = await axios.get(`${NFT_STORAGE_URL}/${uri.split('ipfs://')[1]}`);
    metadata = res.data
  } else if (uri.startsWith('data:application/json;base64')) {
    metadata = JSON.parse(atob(uri.substring(29)).replace(/\n/g, ' '));
  }

  metadata.isVideo = metadata.image ? VIDEO_EXTENSIONS.includes(last(metadata.image.split('.'))) : false;
  metadata.animationIsAudio = metadata.animation_url ? ['mp3', 'wav'].includes(last(metadata.animation_url.split('.'))) : false;

  if (!metadata.name) {
    metadata.name = metadata?.properties?.name;
  }

  return metadata;
};

export const getContractDataCrescendo = async (address: string, chainId: number, signer: Signer | undefined) => {
  const sdk = new DecentSDK(chainIdToChain[chainId], signer || defaultProvider(chainId));

  try {
    const contract = await crescendo.getContract(sdk, address);
    const [metadata, price, totalSupply, saleIsActive] = await Promise.all([
      _getMetadata(sdk, contract, CONTRACT_TYPE_CRESCENDO),
      contract.calculateCurvedMintReturn(1, 0),
      contract.totalSupply(0),
      contract.saleIsActive()
    ]);

    return {
      contract,
      metadata,
      price,
      totalSupply,
      availableSupply: '∞',
      saleIsActive,
      decentURL: `${DECENT_HQ}/${chainId}/Crescendo/${address}`
    };
  } catch (error) {
    console.log(error);
  }
};

export const getContractDataEdition = async (address: string, chainId: number, signer: Signer | undefined) => {
  const sdk = new DecentSDK(chainIdToChain[chainId], signer || defaultProvider(chainId));
  try {
    const contract = await edition.getContract(sdk, address);

    const [metadata, price, totalSupply, availableSupply, saleIsActive] = await Promise.all([
      _getMetadata(sdk, contract, CONTRACT_TYPE_EDITION),
      contract.tokenPrice(),
      contract.totalSupply(),
      contract.MAX_TOKENS(),
      contract.saleIsActive()
    ]);

    return {
      contract,
      metadata,
      price,
      totalSupply,
      availableSupply,
      saleIsActive,
      decentURL: `${DECENT_HQ}/${chainId}/Editions/${address}`
    };
  } catch (error) {
    console.log(error);
  }
};

export const getContractDataZkEdition = async (address: string, chainId: number, signer: Signer | undefined) => {
  const sdk = new DecentSDK(chainIdToChain[chainId], signer || defaultProvider(chainId));
  try {
    const contract = await zkEdition.getContract(sdk, address);
    const [metadata, totalSupply, availableSupply] = await Promise.all([
      _getMetadata(sdk, contract, CONTRACT_TYPE_ZK_EDITION),
      contract.totalSupply(),
      contract.MAX_TOKENS()
    ]);

    return {
      contract,
      metadata,
      totalSupply,
      availableSupply,
      // decentURL: `${DECENT_HQ}/${chainId}/ZkEditions/${address}`
    };
  } catch (error) {
    console.log(error);
  }
};

export const getContractData = async (address: string, chainId: number, signer: Signer | undefined, contractType: string) => {
  if (contractType === CONTRACT_TYPE_CRESCENDO) {
    return await getContractDataCrescendo(address, chainId, signer);
  } else if (contractType === CONTRACT_TYPE_EDITION) {
    return await getContractDataEdition(address, chainId, signer);
  } else if (contractType === CONTRACT_TYPE_ZK_EDITION) {
    return await getContractDataZkEdition(address, chainId, signer);
  }

  throw new Error(`getDecentNFT: invalid contract type: ${contractType}`);
};
