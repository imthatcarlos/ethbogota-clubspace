import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getContractDataZkEdition } from "@/services/decent/getDecentNFT";
import {
  DEFAULT_PARTY_FAVOR,
  CONTRACT_TYPE_ZK_EDITION,
  ZK_EDITION_CHAIN_ID
} from "@/services/decent/utils";
import { IS_PRODUCTION } from "@/lib/consts";

export default (
  address: string,
  chainId: number,
  signer: Signer,
  options: UseQueryOptions = {}
) => {
  const result = useQuery<any>(
    ["decent-deployed-zkEdition", address],
    async () => {
      const res = await fetch(`/api/decent/getDeployedContracts?address=${address}`);
      const contracts = (await res.json())
        .filter(({ key, chainid }) => key === CONTRACT_TYPE_ZK_EDITION && chainid === ZK_EDITION_CHAIN_ID);

      // a default party favor for hosts to use
      if (IS_PRODUCTION) {
        contracts.push({ deployment: DEFAULT_PARTY_FAVOR, chainid: 137 });
        console.log('zkeditions: ', contracts);
      }

      if (!contracts.length) return [];

      return await Promise.all(contracts.map(async ({ deployment }) => {
        const data = await getContractDataZkEdition(deployment, ZK_EDITION_CHAIN_ID);

        return {
          ...data,
          address: deployment
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
