import { useIdentity } from "@/hooks/identity";
import { claimReward } from "@/lib/semaphore/semaphore";
import { useState } from "react";
import { useAccount } from "wagmi";

const ClaimGoodyBag = ({ groupId }) => {
  const { address } = useAccount();
  const { identity } = useIdentity();
  const [claimed, setClaimed] = useState(false);

  const submit = async () => {
    const success = await claimReward(groupId, address, identity);
    if (success) {
      setClaimed(true);
    }
  };

  if (claimed) {
    return <div>Your claim has been submitted! Your goody bag will arrive in your wallet shortly</div>;
  }

  return (
    <div>
      <h2 className="text-md font-bold tracking-tight sm:text-lg md:text-xl">You've got a reward!</h2>
      <button
        className="flex w-36 mt-4 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={submit}
      >
        Claim Reward
      </button>
    </div>
  );
};

export default ClaimGoodyBag;
