import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default (address) => {
  if (address && address.length) {
    address = ethers.utils.getAddress(address);
  }
  const [ensName, setENSName] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resolveENS = async () => {
      setLoading(true);
      if (ethers.utils.isAddress(address)) {
        try {
          const provider = new ethers.providers.getDefaultProvider();
          const ensName = await provider.lookupAddress(address);
          setENSName(ensName);
        } finally {
          setLoading(false);
        }
      }
    };
    resolveENS();
  }, [address]);

  return { ensName, loading };
};
