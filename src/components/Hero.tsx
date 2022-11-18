import { useState } from "react";
import dynamic from "next/dynamic"
import ClubspaceNeon from "@/assets/svg/clubspace-neon.svg";
import useIsMounted from "@/hooks/useIsMounted";

const JamProviderWrapper = dynamic(() => import('@/components/JamProviderWrapper'), { ssr: false });
const CreateSpace = dynamic(() => import('@/components/CreateSpace'), { ssr: false });

export const Hero = () => {
  const isMounted = useIsMounted();
  let [modalOpen, setModalOpen] = useState(false);

  if (!isMounted) return null;

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
      <section className="w-full h-screen">
        <div className="w-full text-secondary px-4 mt-32 flex flex-col gap-8 mix-blend-lighten md:px-16 md:items-center md:justify-center">
          <ClubspaceNeon className="min-w-fit" />
          <h1 className="uppercase text-6xl leading-[85%] tracking-wide font-extrabold w-full font-ownersx md:text-center md:text-[50px]">
            PROMOTE YOUR MUSIC NFTs WITH A{" "}
            <span className="text-primary italic mix-blend-lighten">LIVE</span>
            {" "}LISTENING PARTY
          </h1>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex capitalize w-fit font-sf-pro-text"
          >
            Create a space
          </button>
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
