import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectWallet } from "./ConnectWallet";
import { Profile, useGetProfilesOwned } from "@/services/lens/getProfile";
import useIsMounted from "@/hooks/useIsMounted";
import { useLensLogin, useLensRefresh } from "@/hooks/useLensLogin";
import useENS from "@/hooks/useENS";

export const Header = () => {
  const { isConnected, address } = useAccount();
  const { data: profilesResponse } = useGetProfilesOwned({}, address);
  const { ensName, isLoading: isLoadingENS } = useENS(address);
  const isMounted = useIsMounted();

  const { data: lensRefreshData } = useLensRefresh();
  const { data: lensLoginData, refetch: loginWithLens } = useLensLogin();

  return (
    <header className="flex items-center justify-between py-5 px-8 bg-black relative z-10 border-b-[0.1px] border-b-slate-700">
      <div className="logo">
        <Link href="/">
          <a className="flex gap-x-2 items-center">
            <img src="/lil_buddy.png" alt="Clubspace logo" className="max-w-[50px]" />
            <span className="text-black dark:text-white">CLUBSPACE</span>
          </a>
        </Link>
      </div>
      <div className="sponsor abs-center">
        <div className="dark:border dark:border-gray-500 py-2 px-3 text-black dark:text-white">SPONSOR LOGO</div>
      </div>
      <div className="connect">
        <div className="flex gap-4 justify-center md:min-w-[150px]">
          {isConnected && (
            <button
              disabled={lensRefreshData || lensLoginData}
              onClick={() => loginWithLens()}
              className="btn justify-center items-center"
            >
              {!(lensLoginData || lensRefreshData) ? "Login with lens" : profilesResponse?.defaultProfile.handle}
            </button>
          )}
          <ConnectWallet showBalance={false} />
        </div>
      </div>
    </header>
  );
};
