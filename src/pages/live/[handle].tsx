import redisClient from "@/lib/utils/redisClient";
import { fetchPlaylistById } from "@spinamp/spinamp-sdk";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { FC, Fragment, useEffect, useMemo, useRef, useState, useReducer } from "react";
import {
  DispatchPlayerContext,
  PlayerContext,
  playerInitialState,
  playerReducer,
} from "decent-audio-player";
import { useAccount, useQuery } from "wagmi";
import { SpectrumVisualizer, SpectrumVisualizerTheme } from "react-audio-visualizers";
import { Profile, useGetProfilesOwned } from "@/services/lens/getProfile";
import { ConnectWallet } from "@/components/ConnectWallet";
import useENS from "@/hooks/useENS";
import { SPACE_API_URL } from "@/lib/consts";
import { getRadio } from "@/services/radio";

const JamProviderWrapper = dynamic(() => import("@/components/JamProviderWrapper"), { ssr: false });
const LiveSpace = dynamic(() => import("@/components/LiveSpace"), { ssr: false });

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
  const [audioPlayerState, audioPlayerDispatch] = useReducer(playerReducer, playerInitialState);

  if (!clubSpaceObject) {
    push("/404");
    return;
  }

  // @TODO: if clubSpaceObject.stream == null it means the worker hasn't finished
  // - render some component to come back in a little bit?
  if (!clubSpaceObject.streamURL) {

  }

  useEffect(() => {
    if (!isLoadingProfiles) {
      setDefaultProfile(profiles[0]);
      setLoadingDefaultProfile(false);
    }
  }, [address, profiles, isLoadingProfiles]);

  return (
    <>
      {isLoadingEntry && (
        <div className="abs-center">
          <p className="animate-move-txt-bg gradient-txt text-4xl">Entering ClubSpace...</p>
          {
            !isConnected
              ? <div className="flex gap-4 justify-center md:min-w-[300px] mt-50">
                  <ConnectWallet showBalance={false} />
                </div>
              : null
          }
        </div>
      )}
      {isConnected && !loadingDefaultProfile && !isLoadingENS && (
        <JamProviderWrapper>
          <PlayerContext.Provider value={audioPlayerState}>
            <DispatchPlayerContext.Provider value={audioPlayerDispatch}>
              <LiveSpace
                clubSpaceObject={clubSpaceObject}
                defaultProfile={defaultProfile}
                isLoadingEntry={isLoadingEntry}
                setIsLoadingEntry={setIsLoadingEntry}
                address={address}
                handle={defaultProfile?.handle || ensName || address}
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
    const data = await redisClient.get(handle);
    if (!data) {
      // @TODO: space duration should depend on whether the audio stream is still running
      console.log("SPACE NOT FOUND! MAY HAVE EXPIRED FROM REDIS");
      return { props: {} };
    }

    const clubSpaceObject = JSON.parse(data);
    console.log(`found space with id: ${clubSpaceObject.clubSpaceId}`);

    // NOTE: might not be there if the radio worker has not finished
    clubSpaceObject.streamURL = await redisClient.get(`stream/${clubSpaceObject.clubSpaceId}`);

    console.log(clubSpaceObject);

    return { props: { clubSpaceObject } };
  } catch (error) {
    console.log(error);
  }

  return { props: {} };
};
