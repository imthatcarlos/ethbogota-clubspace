import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import ClubspaceNeon from "@/assets/svg/clubspace-neon.svg";
import ClubspaceSoftGlow from "@/assets/svg/soft-glow-filter.svg";
import LensLogoIcon from "@/assets/svg/lens-logo-icon.svg";
import useIsMounted from "@/hooks/useIsMounted";
import useHasBadge from "@/hooks/useHasBadge";
import { useLensLogin, useLensRefresh } from "@/hooks/useLensLogin";
import { useGetProfilesOwned } from "@/services/lens/getProfile";
import { ConnectWallet } from "@/components/ConnectWallet";
import { IM_WITH_THE_DJ, GOOGLE_FORM_WAITLIST_URL } from "@/lib/consts";
import ActivityFeed from "./ActivityFeed";
import { UpcomingFeed } from "./UpcomingFeed";
import { Button } from "@/components/Button";

const JamProviderWrapper = dynamic(() => import("@/components/JamProviderWrapper"), { ssr: false });
const CreateSpace = dynamic(() => import("@/components/CreateSpace"), { ssr: false });

export const Hero = () => {
  const isMounted = useIsMounted();
  let [modalOpen, setModalOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const { data: lensLoginData, refetch: loginWithLens } = useLensLogin();
  const { data: lensRefreshData } = useLensRefresh();
  const { data: profilesResponse } = useGetProfilesOwned({}, address);
  const { data: hasBadge, isLoading: isLoadingBadge } = useHasBadge();

  useEffect(() => {
    if (!isLoadingBadge && isMounted && isConnected) {
      toast("ClubSpace is currently in open beta. Handle with care. Stay hydrated.", { duration: 10000, icon: "🚧" });
    }
  }, [isLoadingBadge, isMounted, isConnected]);

  // NO LONGER IN CLOSED BETA
  // const shouldRenderCreate = !isLoadingBadge && (hasBadge || IM_WITH_THE_DJ.includes(address));
  const shouldRenderCreate = true;

  if (!isMounted) return null;

  return (
    <div className="relative min-h-screen flex-1 overflow-hidden bg-[var(--hero-gradient)]">
      <div className="hidden sm:absolute sm:inset-0 sm:block" aria-hidden="true">
        <svg
          className="absolute bottom-0 right-0 mb-48 translate-x-1/2 transform text-gray-700 lg:top-0 lg:mt-28 lg:mb-0 xl:translate-x-0 xl:transform-none"
          width={364}
          height={384}
          viewBox="0 0 364 384"
          fill="none"
        >
          <defs>
            <pattern
              id="eab71dd9-9d7a-47bd-8044-256344ee00d0"
              x={0}
              y={0}
              width={20}
              height={20}
              patternUnits="userSpaceOnUse"
            >
              <rect x={0} y={0} width={4} height={4} fill="currentColor" />
            </pattern>
          </defs>
          <rect width={364} height={384} fill="url(#eab71dd9-9d7a-47bd-8044-256344ee00d0)" />
        </svg>
      </div>
      <section className="w-full">
        <div className="mt-12 flex w-full flex-col items-center justify-center gap-8 px-16 text-secondary mix-blend-lighten sm:mt-32">
          <ClubspaceSoftGlow />
          <ClubspaceNeon className="svg-logo min-w-fit" />
          <h2 className="font-ownersx landing-page-subtext-shadow w-full text-center text-6xl text-[37px] uppercase tracking-wide">
            <span className="block">PROMOTE YOUR NFT DROPS</span>
            <span className="block">
              WITH A <span className="font-extrabold italic text-primary text-club-red mix-blend-lighten">LIVE</span>{" "}
              LISTENING PARTY
            </span>
          </h2>

          {isConnected ? (
            <>
              {!(lensLoginData || lensRefreshData) ? (
                <Button
                  onClick={() => loginWithLens()}
                  className="btn-lens relative items-center justify-center overflow-hidden"
                >
                  <LensLogoIcon className="absolute -top-1 left-0 h-16 w-16" />
                  <span className="z-10 pl-4">Login with Lens</span>
                </Button>
              ) : (
                <>
                  {shouldRenderCreate ? (
                    <Button className="font-sf-pro-text" onClick={() => setModalOpen(true)}>
                      Create a space
                    </Button>
                  ) : (
                    // <button
                    //   className="btn-create-space font-sf-pro-text relative inline-flex w-fit overflow-hidden rounded-md bg-white py-3 px-6 text-xl font-bold capitalize text-black transition-all duration-300 hover:-translate-y-[2px] hover:text-white"
                    // >
                    //   <span className="z-10">Create a space</span>
                    // </button>
                    <>
                      <button
                        disabled
                        className="font-sf-pro-text relative inline-flex w-fit overflow-hidden rounded-md bg-white py-3 px-6 text-xl font-bold capitalize text-black"
                      >
                        <span className="z-10">Closed Beta</span>
                      </button>
                      <span className="z-10">
                        Get access with our{" "}
                        <a
                          href="https://playground.sismo.io/madfi-lens-followers-s01"
                          target="_blank"
                          rel="noreferrer"
                          className="font-extrabold text-club-red"
                        >
                          Sismo Badge
                        </a>{" "}
                        or get on the{" "}
                        <a
                          href={GOOGLE_FORM_WAITLIST_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="font-extrabold text-club-red"
                        >
                          Creator Waitlist
                        </a>
                      </span>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <ConnectWallet showBalance={false} />
          )}
          <UpcomingFeed />
          <ActivityFeed />
        </div>
        <div className="w-full">
          <JamProviderWrapper>
            <CreateSpace isOpen={modalOpen} setIsOpen={setModalOpen} />
          </JamProviderWrapper>
        </div>
      </section>
    </div>
  );
};
