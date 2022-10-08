import { APP_NAME } from "@/lib/consts";
import { useLensLogin } from "@/services/lens/login";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { ConnectWallet } from "./ConnectWallet";
import { Profile, useGetProfilesOwned } from "@/services/lens/getProfile";
import CreateSpace from "@/components/CreateSpace";

export const Hero = () => {
  const { isConnected, address } = useAccount();
  const [defaultProfile, setDefaultProfile] = useState<Profile>();
  const { data: profiles } = useGetProfilesOwned({}, address);

  useEffect(() => {
    if (profiles?.length) {
      setDefaultProfile(profiles[0]);
    }
  }, [address, profiles]);

  const { data, refetch: login } = useLensLogin();

  return (
    <div className="relative overflow-hidden">
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
      <div className="relative pt-6 pb-16 sm:pb-24">
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6" aria-label="Global">
          <div className="flex flex-1 items-center">
            <div className="flex w-full items-center justify-between md:w-auto">
              <a href="#">
                <span className="sr-only">{APP_NAME}</span>
                {/* <Image
                  className="h-8 w-auto sm:h-10"
                  src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                  alt={APP_NAME}
                /> */}
              </a>
            </div>
            <div className="hidden space-x-10 md:ml-10 md:flex"></div>
          </div>
          <div className="flex gap-4 justify-center md:min-w-[300px]">
            {isConnected && (
              <button onClick={() => login()} className="btn justify-center items-center">
                {!data ? "Login with lens" : defaultProfile?.handle}
              </button>
            )}
            <ConnectWallet showBalance={false} />
          </div>
        </nav>

        <main className="mt-16 sm:mt-24">
          <div className="max-w-7xl lg:mx-auto">
            <div className="lg:mt-16 lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="px-4 sm:px-6 sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:flex  lg:text-left">
                <div>
                  <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Clubspace</h1>
                  <p className="mt-3 text-base sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    Host an online live listening party for all your Lens frens 🔥
                    <br />
                    Music NFTs. Live Reactions. Good vibes.
                    <br />
                    Everyone that parties - and can <strong>prove</strong> it - gets swag NFTs
                  </p>
                  {!isConnected && (
                    <div className="pt-4">
                      <ConnectWallet label="Get started now" />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-24 md:mt-0 lg:col-span-6 lg:mt-0">
                <div className="bg-transparent sm:mx-auto sm:w-full sm:max-w-md sm:overflow-hidden sm:rounded-lg">
                  <div className="px-4 sm:px-10">
                    <div className="w-full">
                      <CreateSpace defaultProfile={defaultProfile} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
