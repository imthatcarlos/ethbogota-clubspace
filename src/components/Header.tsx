import { useRouter } from "next/router";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectWallet } from "./ConnectWallet";
import { useGetProfilesOwned } from "@/services/lens/getProfile";
import useIsMounted from "@/hooks/useIsMounted";
import { useLensLogin, useLensRefresh } from "@/hooks/useLensLogin";
import useENS from "@/hooks/useENS";

export const Header = () => {
  const { isConnected, address } = useAccount();
  const { data: profilesResponse } = useGetProfilesOwned({}, address);
  const { data: lensRefreshData } = useLensRefresh();
  const { data: lensLoginData, refetch: loginWithLens } = useLensLogin();

  const router = useRouter();
  const isLandingPage = router.pathname === "/";

  return (
    <header className="flex items-center justify-between py-6 px-4 xs:px-8 bg-black relative z-10 border-b-[0.1px] border-b-slate-700">
      <div className="logo">
        <Link href="/">
          <a className="flex gap-x-2 items-center flex-col xs:flex-row">
            <img src="/clubspace-logo.png" alt="Clubspace logo" className="max-w-[75px]" />
            <span className="text-black dark:text-white">CLUBSPACE</span>
          </a>
        </Link>
      </div>
      {!isLandingPage && (
        <div className="sponsor abs-center">
          <a href="https://www.11captainsclub.io" target="_blank" rel="noreferrer" className="realtive group">
            <img
              src="https://images.squarespace-cdn.com/content/v1/634560daa851a4455c79fb20/58b4cc9d-7973-4235-a915-c382875f68f7/E11EVEN+White+LOGO.png?format=1500w"
              alt=""
              style={{ maxWidth: "150px", height: "auto" }}
            />
            <span className="abs-center opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-[22px] group-hover:scale-100 text-sm text-gray-200 whitespace-nowrap">
              [ SPONSOR ]
            </span>
          </a>
        </div>
      )}
      <div className="connect absolute right-0 xs:relative">
        <div className="flex gap-4 justify-center md:min-w-[150px] scale-[0.8] xs:scale-100">
          {isConnected && (
            <button onClick={() => loginWithLens()} className="btn justify-center items-center">
              {!(lensLoginData || lensRefreshData) ? "Login with lens" : profilesResponse?.defaultProfile.handle}
            </button>
          )}
          <ConnectWallet showBalance={false} />
        </div>
      </div>
    </header>
  );
};
