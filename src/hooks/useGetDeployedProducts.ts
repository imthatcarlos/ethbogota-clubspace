import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getContractData } from "@/services/decent/getDecentNFT";
import { CHAIN_NAME_MAP, ALLOWED_CHAIN_IDS } from "@/lib/consts";
import { CONTRACT_TYPE_ZK_EDITION } from "@/services/decent/utils";

export default (
  address: string,
  chainId: number,
  signer: Signer,
  options: UseQueryOptions = {}
) => {
  const result = useQuery<any>(
    ["decent-deployed-products", address],
    async () => {
      const res = await fetch(`/api/decent/getDeployedContracts?address=${address}`);
      const data = (await res.json());
      const contracts = data
        .filter(({ chainid, key }) => ALLOWED_CHAIN_IDS.includes(chainid) && key !== CONTRACT_TYPE_ZK_EDITION);

      if (!contracts.length) return [];

      return await Promise.all(contracts.map(async ({ deployment, chainid, key }) => {
        const data = await getContractData(deployment, chainid, undefined, key);

        return {
          ...data,
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
