import { ConnectWallet } from "@/components/ConnectWallet";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAccount } from "wagmi";

const Profile = () => {
  const { address, isConnected } = useAccount();
  const { push } = useRouter();

  useEffect(() => {
    if (isConnected) {
      push("/u/" + address);
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="mt-12 ml-12 full-height-page">
        <h2 className="text-md font-bold tracking-tight sm:text-lg md:text-xl">
          Please connect your wallet to continue
        </h2>
        <div className="flex gap-4 justify-center md:min-w-[300px] mt-50 pt-8">
          <ConnectWallet showBalance={false} />
        </div>
      </div>
    );
  }

  return <div className="mt-12 ml-12 full-height-page">Redirecting...</div>;
};

export default Profile;
