import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getContractData } from "@/services/decent/getDecentNFT";
import { CHAIN_NAME_MAP, ALLOWED_CHAIN_IDS } from "@/lib/consts";
import { CONTRACT_TYPE_ZK_EDITION, CONTRACT_TYPE_EDITION, CONTRACT_TYPE_CRESCENDO } from "@/services/decent/utils";

// only for testing
const DEFAULT_ADDRESS = '0x28ff8e457feF9870B9d1529FE68Fbb95C3181f64';
const DEFAULT_FEATURED_NFT = {
  deployment: '0xCF42dE2a184D3c3eDC05CFD6A836854Fb2700f2f',
  chainid: 1,
  key: CONTRACT_TYPE_EDITION,
};

export default (
  address: string,
  chainId: number,
  signer: Signer,
  options: UseQueryOptions = {}
) => {
  const result = useQuery<any>(
    ["decent-drops", address],
    async () => {
      const res = await fetch(`/api/decent/getDeployedContracts?address=${address}`);
      const data = (await res.json());
      const contracts = data
        .filter(({ chainid, key }) => ALLOWED_CHAIN_IDS.includes(chainid) && key !== CONTRACT_TYPE_ZK_EDITION);

      if (address === DEFAULT_ADDRESS && contracts.length === 0) {
        contracts.push(DEFAULT_FEATURED_NFT);
      }

      if (!contracts.length) return [];

      // uncomment if on mumbai and want to test with a specific contract
      // const contracts = [{deployment: "0xaAd7E6c2E0bD6ab8D6B0a56785c103868d20FE86", chainid: 80001, key: CONTRACT_TYPE_CRESCENDO}]

      return await Promise.all(contracts.map(async ({ deployment, chainid, key }) => {
        const data = await getContractData(deployment, chainid, undefined, key);
        const soldOut = data.availableSupply && data.totalSupply
          ? data.availableSupply === data.totalSupply
          : undefined;

        return {
          ...data,
          soldOut,
          address: deployment,
          contractType: key,
          chain: CHAIN_NAME_MAP[chainid],
          chainId: chainid,
        };
      }));
    },
    {
      ...(options as any),
      enabled: !!address,
    }
  );

  return result;
};
