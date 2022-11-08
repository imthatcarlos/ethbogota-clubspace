import redisClient from "@/lib/utils/redisClient";
import { fetchPlaylistById } from "@spinamp/spinamp-sdk";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { FC, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useQuery } from "wagmi";
import { SpectrumVisualizer, SpectrumVisualizerTheme } from "react-audio-visualizers";
import { Profile, useGetProfilesOwned } from "@/services/lens/getProfile";
import LiveSpace from "@/components/LiveSpace";
import useENS from "@/hooks/useENS";
import { SPACE_API_URL } from "@/lib/consts";

const LivePageAtHandle: FC<any> = ({ clubSpaceObject }) => {
  const {
    push,
    query: { handle },
  } = useRouter();

  const { address, isConnected } = useAccount();
  const { data: profiles, isLoading: isLoadingProfiles } = useGetProfilesOwned({}, address);
  const { ensName, isLoading: isLoadingENS } = useENS(address);
  const [defaultProfile, setDefaultProfile] = useState<Profile>();
  const [loadingDefaultProfile, setLoadingDefaultProfile] = useState(true);
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);

  if (!clubSpaceObject) {
    push("/404");
    return;
  }

  useEffect(() => {
    if (!isLoadingProfiles) {
      setDefaultProfile(profiles[0]);
      setLoadingDefaultProfile(false);
    }
  }, [address, profiles, isLoadingProfiles]);

  // * - load the playlist live audio stream (TBD)
  // * - load the decent featured NFT + tx history

  return (
    <>
      {
        isLoadingEntry && <>Entering the ClubSpace...</>
      }
      {
        !isLoadingEntry && (
          <div className="w-full relative h-[60vh]">
            <SpectrumVisualizer
              audio={`${SPACE_API_URL}/ws/stream/${clubSpaceObject.clubSpaceId}`}
              theme={SpectrumVisualizerTheme.squaredBars}
              colors={["#4f46e5", "#6366f1"]}
              iconsColor="#4f46e5"
              backgroundColor="#000"
              showMainActionIcon={false}
              showLoaderIcon
              highFrequency={8000}
            />
          </div>
        )
      }
      {
        isConnected && !loadingDefaultProfile && !isLoadingENS && (
          <LiveSpace
            clubSpaceObject={clubSpaceObject}
            defaultProfile={defaultProfile}
            isLoadingEntry={isLoadingEntry}
            setIsLoadingEntry={setIsLoadingEntry}
            address={address}
            handle={defaultProfile?.handle || ensName || address}
          />
        )
      }
    </>
  );
};

export default LivePageAtHandle;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { handle },
  } = context;

  try {
    const data = await redisClient.get(handle);
    if (!data) return { props: {} };

    const clubSpaceObject = JSON.parse(data);
    console.log(clubSpaceObject);

    return { props: { clubSpaceObject } };
  } catch (error) {
    console.log(error);
  }

  return { props: {} };
};
