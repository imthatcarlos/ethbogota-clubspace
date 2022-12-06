import { useEffect, useState } from "react";
import { utils, providers } from "ethers";

export default (address) => {
  if (address && address.length) {
    address = utils.getAddress(address);
  }
  const [ensName, setENSName] = useState(null);
  const [ensAvatar, setEnsAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resolveENS = async () => {
      setLoading(true);
      if (utils.isAddress(address)) {
        try {
          const provider = new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_MAINNET);

          const [name, avatar] = await Promise.all([
            provider.lookupAddress(address),
            provider.getAvatar(address)
          ]);

          console.log(avatar)

          setENSName(ensName);
          setEnsAvatar(avatar);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
    };
    resolveENS();
  }, [address]);

  return { ens: { ensName, ensAvatar }, loading };
};
