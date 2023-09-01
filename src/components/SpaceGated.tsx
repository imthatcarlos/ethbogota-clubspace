import { useMemo, useEffect } from "react";
import { useAccount } from "wagmi";
import LensLogoIcon from "@/assets/svg/lens-logo-icon.svg";
import { ConnectWallet } from "./ConnectWallet";
import PinnedLensPost from "./PinnedLensPost";
import { useLensLogin, useLensRefresh } from "@/hooks/useLensLogin";
import { TIER_OPEN, TIER_GATED_LENS_COLLECT, LENSTER_URL } from "@/lib/consts";
import { GateData } from "./LiveSpace";

export const SpaceGated = ({
  handle,
  gated,
  creatorLensProfileId,
  lensPubId,
  refetchMeetsGatedCondition,
}: {
  handle: string;
  gated: GateData;
  creatorLensProfileId: string;
  lensPubId: string;
  refetchMeetsGatedCondition: () => void;
}) => {
  const { isConnected } = useAccount();
  const { data: lensLoginData, refetch: loginWithLens } = useLensLogin();
  const { data: lensRefreshData } = useLensRefresh();

  const requirement = useMemo(() => {
    if (gated?.tier === TIER_GATED_LENS_COLLECT) {
      return "To join this space, you must login with Lens and collect the post";
    }
  }, [gated]);

  const _loginWithLens = async () => {
    await loginWithLens();

    // re-fetch
    refetchMeetsGatedCondition();
  };

  return (
    <div className="min-h-screen">
      <div className="min-h-full px-4 py-16 sm:px-6 sm:py-24 md:grid lg:px-8 md:place-items-center">
        <div className="mx-auto max-w-max">
          <div className="sm:border-l sm:border-gray-200 sm:pl-6">
            <h1 className="animate-move-txt-bg gradient-txt text-4xl font-bold tracking-tight sm:text-5xl">
              ClubSpace Is Token-Gated
            </h1>
            <p className="mt-1 text-base text-gray-500">hosted by @{handle}</p>
          </div>

          <h2 className="mt-8 my-4 text-3xl font-bold tracking-tight sm:text-2xl md:text-4xl text-center">
            {requirement}
          </h2>

          <div className="md:items-center md:justify-center mt-8">
            {!isConnected && <ConnectWallet showBalance={false} />}

            {isConnected && !(lensLoginData || lensRefreshData) && (
              <div className="w-60 mx-auto">
                <button
                  onClick={_loginWithLens}
                  className="relative btn btn-lens h-[45px] btn justify-center items-center overflow-hidden"
                >
                  <LensLogoIcon class="absolute -top-1 left-0 w-16 h-16" />
                  <span className="z-10">Login with Lens</span>
                </button>
              </div>
            )}

            {isConnected && (lensLoginData || lensRefreshData) && (
              <>
                <PinnedLensPost
                  url={`${LENSTER_URL}/posts/${creatorLensProfileId}-${lensPubId}`}
                  small={false}
                  renderHeader={false}
                  renderCollectButton={true}
                  gated={gated}
                  onCollect={refetchMeetsGatedCondition}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
