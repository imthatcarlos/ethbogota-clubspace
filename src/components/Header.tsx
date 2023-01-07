import { useAccount } from "wagmi";
import { ConnectWallet } from "./ConnectWallet";
import { useGetProfilesOwned } from "@/services/lens/getProfile";
import { useLensLogin, useLensRefresh } from "@/hooks/useLensLogin";
import ClubspaceNeonHeader from "@/assets/svg/clubspace-neon-header.svg";
import { useRouter } from "next/router";

export const Header = () => {
  const { push } = useRouter();
  const { isConnected, address } = useAccount();
  const { data: profilesResponse } = useGetProfilesOwned({}, address);
  const { data: lensRefreshData } = useLensRefresh();
  const { data: lensLoginData, refetch: loginWithLens } = useLensLogin();

  const lensButton = () => {
    if (!(lensLoginData || lensRefreshData)) {
      loginWithLens();
    } else {
      push("/u/" + address);
    }
  };

  return (
    <header className="flex items-center justify-between py-4 px-4 xs:px-8 bg-black relative z-10 border-b-[0.1px] border-b-slate-700">
      <div className="logo -ml-16 md:ml-0">
        <div className="flex gap-x-2 items-center flex-col xs:flex-row">
          <a href="/" className="realtive group">
            <ClubspaceNeonHeader height={65} />
          </a>
        </div>
      </div>
      {/**!isLandingPage && (
        <div className="sponsor abs-center">
          <a href="https://www.11captainsclub.io" target="_blank" rel="noreferrer" className="realtive group">
            <img
              src="https://images.squarespace-cdn.com/content/v1/634560daa851a4455c79fb20/58b4cc9d-7973-4235-a915-c382875f68f7/E11EVEN+White+LOGO.png?format=1500w"
              alt=""
              style={{ maxWidth: "150px", height: "auto" }}
            />
            <span className="abs-center opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-[22px] group-hover:scale-100 text-sm text-gray-200 whitespace-nowrap">
              [ SPONSORED BY ]
            </span>
          </a>
        </div>
      )*/}
      <div className="connect md:right-5 xs:relative">
        <div className="md:flex gap-4 justify-center md:min-w-[250px] scale-[0.8] xs:scale-100">
          <div className="mb-2 sm:mb-0">
            <ConnectWallet showBalance={false} />
          </div>
          {isConnected && (
            <button
              onClick={lensButton}
              className="btn btn-lens justify-center items-center"
            >
              {!(lensLoginData || lensRefreshData)
                ? "Login with Lens"
                : profilesResponse?.defaultProfile.handle || "No Lens"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
