import { claimReward } from "@/lib/semaphore/semaphore";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getAddress } from "ethers/lib/utils";
import { useState } from "react";
import { useAccount } from "wagmi";

const mainnetProvider = new JsonRpcProvider(process.env.NEXT_PUBLIC_MAINNET_RPC);

const ClaimGoodyBag = ({ attendanceProps }) => {
  const { groupId, claimed, identity } = attendanceProps;
  const { address } = useAccount();
  const [newClaim, setNewClaim] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState("");

  const submit = async () => {
    setLoading(true);
    let resolvedAddress = recipient.trim();
    try {
      if (recipient.endsWith(".eth")) {
        resolvedAddress = await mainnetProvider.resolveName(recipient);
      } else {
        resolvedAddress = getAddress(recipient);
      }
    } catch {
      console.error("invalid address");
    }
    const success = await claimReward(groupId, resolvedAddress, identity, address);
    if (success) {
      setNewClaim(true);
    }
    setLoading(false);
  };

  if (claimed || newClaim) {
    return <div>Your claim has been submitted! Your goody bag will arrive in your wallet shortly</div>;
  }

  return (
    <div className="mb-4">
      <p>You've got a reward!</p>
      <input
        className="w-[27rem] p-2 rounded-sm mt-2"
        placeholder="Recipient address or ENS..."
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <button
        className="flex w-36 mt-4 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={submit}
      >
        {loading ? "..." : "Claim Reward"}
      </button>
    </div>
  );
};

export default ClaimGoodyBag;
