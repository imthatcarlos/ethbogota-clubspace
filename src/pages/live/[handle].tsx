import redisClient from "@/lib/utils/redisClient";
import { fetchPlaylistById } from "@spinamp/spinamp-sdk";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { FC, Fragment, useEffect, useMemo, useRef, useState, useReducer } from "react";
import { DispatchPlayerContext, PlayerContext, playerInitialState, playerReducer } from "decent-audio-player";
import { useAccount, useNetwork, useQuery } from "wagmi";
import { SpectrumVisualizer, SpectrumVisualizerTheme } from "react-audio-visualizers";
import { Profile, useGetProfilesOwned } from "@/services/lens/getProfile";
import { ConnectWallet } from "@/components/ConnectWallet";
import useENS from "@/hooks/useENS";
import { SPACE_API_URL, REDIS_SPACE_PREFIX, REDIS_STREAM_PREFIX } from "@/lib/consts";
import { getCurrentTrack } from "@/services/radio";
import useHasBadge from "@/hooks/useHasBadge";

const JamProviderWrapper = dynamic(() => import("@/components/JamProviderWrapper"), { ssr: false });
const LiveSpace = dynamic(() => import("@/components/LiveSpace"), { ssr: false });

const LivePageAtHandle: FC<any> = ({ clubSpaceObject }) => {
  const {
    push,
    query: { handle },
  } = useRouter();

  const { chain, chains } = useNetwork()
  const { address, isConnected } = useAccount();
  const { data: profilesResponse, isLoading: isLoadingProfiles } = useGetProfilesOwned({}, address);
  const { data: ensData, isLoading: isLoadingENS } = useENS(address);
  const [defaultProfile, setDefaultProfile] = useState<Profile>();
  const [loadingDefaultProfile, setLoadingDefaultProfile] = useState(true);
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const [audioPlayerState, audioPlayerDispatch] = useReducer(playerReducer, playerInitialState);
  const { data: hasBadge, isLoading: isLoadingBadge } = useHasBadge();

  if (!clubSpaceObject) {
    push("/404");
    return;
  }

  const correctNetwork = () => chains.length > 0 && chain.id === chains[0].id;

  useEffect(() => {
    if (!isLoadingProfiles) {
      setDefaultProfile(profilesResponse ? profilesResponse.defaultProfile : null);
      setLoadingDefaultProfile(false);
    }
  }, [address, isLoadingProfiles]);

  return (
    <>
      {isLoadingEntry && (
        <div className="flex-1 min-h-screen">
          <div className="abs-center">
            <p className="animate-move-txt-bg gradient-txt text-4xl">Entering ClubSpace...</p>
            {!isConnected || !correctNetwork() ? (
              <div className="flex gap-4 justify-center md:min-w-[300px] mt-50 pt-8">
                <ConnectWallet showBalance={false} />
              </div>
            ) : null}
          </div>
        </div>
      )}
      {isConnected && !loadingDefaultProfile && defaultProfile && !isLoadingENS && correctNetwork() && (
        <JamProviderWrapper>
          <PlayerContext.Provider value={audioPlayerState}>
            <DispatchPlayerContext.Provider value={audioPlayerDispatch}>
              <LiveSpace
                clubSpaceObject={clubSpaceObject}
                defaultProfile={defaultProfile}
                isLoadingEntry={isLoadingEntry}
                setIsLoadingEntry={setIsLoadingEntry}
                address={address}
                handle={defaultProfile?.handle || ensData?.handle || address}
                hasBadge={hasBadge}
              />
            </DispatchPlayerContext.Provider>
          </PlayerContext.Provider>
        </JamProviderWrapper>
      )}
    </>
  );
};

export default LivePageAtHandle;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { handle },
  } = context;

  try {
    const data = await redisClient.get(`${REDIS_SPACE_PREFIX}/${handle}`);
    if (!data) {
      // @TODO: space duration should depend on whether the audio stream is still running
      console.log("SPACE NOT FOUND! MAY HAVE EXPIRED FROM REDIS");
      return { props: {} };
    }

    const clubSpaceObject = JSON.parse(data);
    console.log(`found space with id: ${clubSpaceObject.clubSpaceId}`);

    // NOTE: might not be there if the radio worker has not finished
    const streamData = await redisClient.get(`${REDIS_STREAM_PREFIX}/${clubSpaceObject.clubSpaceId}`);
    if (streamData) {
      const { streamURL, playerUUID } = JSON.parse(streamData);
      clubSpaceObject.streamURL = streamURL;
      clubSpaceObject.currentTrackId = await getCurrentTrack(playerUUID);
    }

    // console.log(clubSpaceObject);

    return { props: { clubSpaceObject } };
  } catch (error) {
    console.log(error);
  }

  return { props: {} };
};
