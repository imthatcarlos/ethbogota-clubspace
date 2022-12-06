import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getContractDataZkEdition } from "@/services/decent/getDecentNFT";

export default async (
  address: string,
  chainId: number,
  signer: Signer,
  options: UseQueryOptions = {}
) => {
  const result = useQuery<boolean>(
    ["decent-deployed-zkEdition", address],
    async () => {
      const res = await fetch(`/api/decent/getDeployedContracts?address=${address}`);
      const contracts = (await res.json())
        .filter(({ key, chainid }) => key === 'ZkEdition' && chainid === chainId);

      console.log('zkeditions: ', contracts);

      if (!contracts.length) return [];

      return await Promise.all(contracts.map(async (zkEdition) => {
        const data = await getContractDataZkEdition(address, chainId, signer);

        return {
          ...data,
          address
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
