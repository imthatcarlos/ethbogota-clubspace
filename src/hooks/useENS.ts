import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { utils, providers } from "ethers";

export default (address: string, options = {}) => {
  return useQuery({
    queryKey: ["ens", address],
    queryFn: async () => {
      const provider = new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_MAINNET);

      const [handle, avatar] = await Promise.all([
        provider.lookupAddress(address),
        provider.getAvatar(address)
      ]);

      return { handle, avatar };
    },
    enabled: !!address,
    ...(options as any),
  });
};