// import redisClient from "@/lib/utils/redisClient";
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState, useReducer, useMemo } from "react";
import {
  DispatchPlayerContext,
  PlayerContext,
  playerInitialState,
  playerReducer,
  setAudioVolumeAction,
} from "@madfi/ux-components";
import { useAccount } from "wagmi";
import { Profile, useGetProfilesOwned } from "@/services/lens/getProfile";
import useENS from "@/hooks/useENS";
import { NEXT_PUBLIC_SITE_URL, TIER_OPEN } from "@/lib/consts";
import { getLiveClubspace } from "@/services/radio";
import useHasBadge from "@/hooks/useHasBadge";
import { getAccessToken } from "@/hooks/useLensLogin";
import useMeetsGatedCondition from "@/hooks/useMeetsGatedCondition";
import MobileMessage from "@/components/MobileMessage";
// import { UpcomingItem } from "@/components/UpcomingFeed";
import Countdown from "@/components/Countdown";
import { wait } from "@/utils";
import { ClubSpaceObject } from "@/components/LiveSpace";
import { SpaceEnded } from "@/components/SpaceEnded";
import { SpaceGated } from "@/components/SpaceGated";

const JamProviderWrapper = dynamic(() => import("@/components/JamProviderWrapper"), { ssr: false });
const LiveSpace = dynamic(() => import("@/components/LiveSpace"), { ssr: false });

const LivePageAtHandle: NextPage = ({ clubSpaceObject }: { clubSpaceObject: ClubSpaceObject | undefined }) => {
  const {
    query: { handle },
    reload,
  } = useRouter();
  const { address, isConnected } = useAccount();
  const { data: profilesResponse, isLoading: isLoadingProfiles } = useGetProfilesOwned({}, address);
  const {
    data: meetsGatedCondition,
    isLoading: isLoadingMeetsGated,
    refetch: refetchMeetsGatedCondition,
  } = useMeetsGatedCondition(address, getAccessToken(), clubSpaceObject);
  const { data: ensData, isLoading: isLoadingENS } = useENS(address);
  const [defaultProfile, setDefaultProfile] = useState<Profile>();
  const [loadingDefaultProfile, setLoadingDefaultProfile] = useState(true);
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const [audioPlayerState, audioPlayerDispatch] = useReducer(playerReducer, playerInitialState);
  const { data: hasBadge, isLoading: isLoadingBadge } = useHasBadge();
  const [ensDone, setEnsDone] = useState(false);
  const [_canEnter, setCanEnter] = useState(); // undefined until we know true/false

  useEffect(() => {
    if (!isLoadingProfiles) {
      setDefaultProfile(profilesResponse ? profilesResponse.defaultProfile : null);
      setLoadingDefaultProfile(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isLoadingProfiles]);

  useEffect(() => {
    if (!address || !isLoadingENS) {
      setEnsDone(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingENS]);

  useEffect(() => {
    if (!isLoadingMeetsGated) {
      setCanEnter(meetsGatedCondition);
    }
  }, [isLoadingMeetsGated, meetsGatedCondition]);

  const canEnter = useMemo(() => {
    if (!clubSpaceObject?.gated || clubSpaceObject?.gated === TIER_OPEN) return true; // not gated
    if (clubSpaceObject?.creatorLensProfileId === defaultProfile?.id) return true; // is host

    return _canEnter !== false;
  }, [defaultProfile, clubSpaceObject, _canEnter]);

  if (!clubSpaceObject) {
    return <SpaceEnded handle={handle as string} />;
  }

  if (clubSpaceObject.gated && (!getAccessToken() || canEnter === false)) {
    return (
      <SpaceGated
        handle={clubSpaceObject.handle}
        gated={clubSpaceObject.gated}
        creatorLensProfileId={clubSpaceObject.creatorLensProfileId}
        lensPubId={clubSpaceObject.lensPubId}
        refetchMeetsGatedCondition={refetchMeetsGatedCondition}
      />
    );
  }

  return (
    <>
      {isLoadingEntry && clubSpaceObject.queuedTrackIds?.length && canEnter ? (
        <div className="flex-1 min-h-screen">
          <div className="abs-center">
            <p className="animate-move-txt-bg gradient-txt text-4xl">Entering ClubSpace...</p>
            <MobileMessage />
          </div>
        </div>
      ) : null}
      {clubSpaceObject.ended ? (
        <div className="flex-1 min-h-screen">
          <div className="abs-center">
            <p className="animate-move-txt-bg gradient-txt text-4xl">This ClubSpace has ended</p>
          </div>
        </div>
      ) : null}
      {clubSpaceObject.startAt && !clubSpaceObject.ended && !clubSpaceObject.queuedTrackIds?.length ? (
        <div className="flex-1 min-h-screen">
          <div className="abs-center">
            <div className="w-full justify-center">
              <p className="animate-move-txt-bg gradient-txt text-4xl text-center -ml-5">ClubSpace starting in</p>
              <Countdown
                date={clubSpaceObject.startAt * 1000}
                onComplete={async () => {
                  await wait(2000); // wait on the worker...
                  reload();
                }}
              />
              {/** <UpcomingItem activity={clubSpaceObject} link={false} /> */}
            </div>
          </div>
        </div>
      ) : null}
      {!loadingDefaultProfile && ensDone && (!isLoadingBadge || !address) && clubSpaceObject.queuedTrackIds?.length && canEnter ? (
        <JamProviderWrapper>
          <PlayerContext.Provider value={audioPlayerState}>
            <DispatchPlayerContext.Provider value={audioPlayerDispatch}>
              <LiveSpace
                clubSpaceObject={clubSpaceObject}
                defaultProfile={defaultProfile}
                isHost={defaultProfile?.id === clubSpaceObject.creatorLensProfileId}
                isLoadingEntry={isLoadingEntry}
                setIsLoadingEntry={setIsLoadingEntry}
                address={address}
                handle={defaultProfile?.handle || ensData?.handle || address}
                hasBadge={hasBadge}
                playerVolume={audioPlayerState.audioVolume}
                setPlayerVolume={(volume: number) => audioPlayerDispatch(setAudioVolumeAction(volume))}
              />
            </DispatchPlayerContext.Provider>
          </PlayerContext.Provider>
        </JamProviderWrapper>
      ) : null}
    </>
  );
};

export default LivePageAtHandle;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { handle },
  } = context;

  // should never happen
  if (!handle || handle === "<no source>")
    return {
      notFound: true,
    };

  try {
    const clubSpaceObject = await getLiveClubspace(handle as string);
    if (!clubSpaceObject) {
      console.log("SPACE NOT FOUND! MAY HAVE EXPIRED FROM REDIS");
      return {
        // we need to have the handle in the _app when there's no space
        // to provide the correct iframely link
        props: { handle },
      };
    }

    console.log(`found space with id: ${clubSpaceObject.clubSpaceId}`);
    console.log(clubSpaceObject);

    return { props: { clubSpaceObject } };
  } catch (error) {
    console.log(error);
  }

  return {
    notFound: true,
  };
};
