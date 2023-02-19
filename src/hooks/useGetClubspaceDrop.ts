import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { DROP_PROTOCOL_DECENT, DROP_PROTOCOL_SOUND } from "@/lib/consts";
import { getContractData } from "@/services/decent/getDecentNFT";
import getSoundNFT from "@/services/sound/getSoundNFT";

export default (options: UseQueryOptions = {}, { drop, signer }) => {
  const result = useQuery<Profile[]>(
    ["clubspace-drop", drop.contractAddress || drop.decentContractAddress],
    async () => {
      let data;

      if (drop.protocol === DROP_PROTOCOL_DECENT) {
        data = await getContractData(
          clubSpaceObject.decentContractAddress,
          clubSpaceObject.decentContractChainId,
          undefined,
          clubSpaceObject.decentContractType
        );

        data.contractType = contractType;
        data.chainId = chainId;
      } else if (drop.protocol === DROP_PROTOCOL_SOUND) {
        data = await getSoundNFT(drop.contractAddress);
      } else {
        throw new Error('invalid value for drop.protocol: ');
      }

      data.protocol = drop.protocol;

      return data;
    },
    {
      ...(options as any),
      enabled: !!(drop && signer),
    }
  );

  return result;
};
