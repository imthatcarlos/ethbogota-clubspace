import { useState, useEffect, useMemo } from 'react';
import { watchReadContract, readContract } from '@wagmi/core';
import { useAccount } from "wagmi";
import { BigNumber } from "ethers";
import toast from "react-hot-toast";
import { MAD_SBT_CONTRACT_ADDRESS } from '@/lib/consts';
import getActiveMadSBT from '@/services/madfi/getActiveMadSBT';

export const LivePoints = ({
  creatorAddress,
}) => {
  const { address } = useAccount();
  const [activeMadSBTCollectionId, setActiveMadSBTCollectionId] = useState('');
  const [unwatchRewardUnits, setUnwatchRewardUnits] = useState<() => void>();
  const [rewardUnits, setRewardUnits] = useState<Number>(0);

  useMemo(async () => {
    const activeCollectionId = await getActiveMadSBT(creatorAddress);
    setActiveMadSBTCollectionId(activeCollectionId);
  }, [creatorAddress])

  useEffect(() => {
    const fetchRewardUnitsWithWatch = async () => {
      const config = {
        address: MAD_SBT_CONTRACT_ADDRESS,
        abi: ["function rewardUnitsOf(address, uint256) external view returns (uint128)"],
        functionName: 'rewardUnitsOf',
        args: [address, 1]
      };
      const data = await readContract(config);
      setRewardUnits((data as BigNumber).toNumber());

      setUnwatchRewardUnits(watchReadContract(
        config,
        (data: BigNumber) => {
          console.log('sub!');
          console.log(data);
          toast(`+ ${data.toNumber()} MADx`);
          setRewardUnits(data.toNumber());
        },
      ));
    }

    if (activeMadSBTCollectionId) {
      fetchRewardUnitsWithWatch();
    }
  }, [activeMadSBTCollectionId]);

  if (!activeMadSBTCollectionId) return null;

  return (
    <>
      <p>Your MADx balance: {rewardUnits.toString()}</p>
    </>
  );
};