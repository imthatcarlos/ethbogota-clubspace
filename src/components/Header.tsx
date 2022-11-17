import { useLensLogin, useLensRefresh } from "@/hooks/useLensLogin";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectWallet } from "./ConnectWallet";

export const Header = () => {
  const { data: lensRefreshData } = useLensRefresh();
  const { address, isConnected } = useAccount();
  const { data: lensLoginData, refetch: login } = useLensLogin();

  return (
    <div className="flex items-center justify-between py-5 px-8">
      <div className="logo">
        <Link href="/">
          <a className="flex gap-x-2 items-center">
            <img src="/lil_buddy.png" alt="Clubspace logo" className="max-w-[50px]" />
            <span className="text-black dark:text-white">CLUBSPACE</span>
          </a>
        </Link>
      </div>
      <div className="sponsor">
        <div className="dark:border dark:border-gray-500 py-2 px-3 text-black dark:text-white">SPONSOR LOGO</div>
      </div>
      <div className="connect">
        <div className="flex gap-4 justify-center md:min-w-[150px]">
          {isConnected ? (
            <button onClick={() => login()} className="btn justify-center items-center">
              Connect
            </button>
          ) : (
            <ConnectWallet showBalance={false} />
          )}
        </div>
      </div>
    </div>
  );
};
