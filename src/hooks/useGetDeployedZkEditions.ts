import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getContractDataZkEdition } from "@/services/decent/getDecentNFT";
import { DEFAULT_PARTY_FAVOR, CONTRACT_TYPE_ZK_EDITION, ZK_EDITION_CHAIN_ID } from "@/services/decent/utils";
import { IS_PRODUCTION, VERIFIER_ADDRESS } from "@/lib/consts";
import { BigNumberish, Contract } from "ethers";
import axios from "axios";

export const getZkEditionList = (address: string, chainId: number, signer: any, options: UseQueryOptions = {}) => {
  const result = useQuery<any>(
    ["decent-deployed-zkEdition", address],
    async () => {
      const res = await fetch(`/api/decent/getDeployedContracts?address=${address}`);
      const contracts = (await res.json()).filter(
        ({ key, chainid }) => key === CONTRACT_TYPE_ZK_EDITION && chainid === ZK_EDITION_CHAIN_ID
      );

      // a default party favor for hosts to use
      if (IS_PRODUCTION) {
        contracts.push({ deployment: DEFAULT_PARTY_FAVOR, chainid: 137 });
      }

      if (!contracts.length) return [];

      return await Promise.all(
        contracts.map(async ({ deployment }) => {
          const data = await getContractDataZkEdition(deployment, chainId, signer);

          return {
            ...data,
            address: deployment,
          };
        })
      );
    },
    {
      ...(options as any),
      enabled: !!address,
    }
  );

  return result;
};

export const getDeploymentForGroup = (
  groupId: BigNumberish,
  chainId: number,
  signer: any,
  options: UseQueryOptions = {}
) => {
  const result = useQuery<any>(
    ["decent-deployed-zkEdition-by-group", groupId],
    async () => {
      const contract = new Contract(
        VERIFIER_ADDRESS,
        ["function groupIdCollections(uint256 groupId) public view returns(address)"],
        signer
      );
      const deployment = await contract.groupIdCollections(groupId);
      const data = await getContractDataZkEdition(deployment, chainId, signer);

      const baseUri = await data.contract.baseURI();
      const { data: uriObject } = await axios.get(`https://ipfs.io/ipfs/${baseUri.substring(7)}`);

      return {
        ...data,
        address: deployment,
        imgUri: uriObject.image,
        description: uriObject.description,
      };
    },
    {
      ...(options as any),
      enabled: !!groupId,
    }
  );
  return result;
};
