import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getContractDataZkEdition } from "@/services/decent/getDecentNFT";

const DEFAULT_PARTY_FAVOR = '0xb2d816eca2b50d48bd632f74ef7cdbc2123f6c79';

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
        .filter(({ key, chainid }) => key === 'ZkEdition' && chainid === chainId);

      contracts.push(DEFAULT_PARTY_FAVOR);
      console.log('zkeditions: ', contracts);

      if (!contracts.length) return [];

      return await Promise.all(contracts.map(async (zkEdition) => {
        const data = await getContractDataZkEdition(zkEdition, chainId, signer);

        return {
          ...data,
          address: zkEdition
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
