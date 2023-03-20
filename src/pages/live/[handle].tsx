// import redisClient from "@/lib/utils/redisClient";
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { useEffect, useState, useReducer } from "react";
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
import { NEXT_PUBLIC_SITE_URL } from "@/lib/consts";
import { getLiveClubspace } from "@/services/radio";
import useHasBadge from "@/hooks/useHasBadge";
import MobileMessage from "@/components/MobileMessage";
// import { UpcomingItem } from "@/components/UpcomingFeed";
import Countdown from "@/components/Countdown";
import { wait } from "@/utils";
import { ClubSpaceObject } from "@/components/LiveSpace";

const JamProviderWrapper = dynamic(() => import("@/components/JamProviderWrapper"), { ssr: false });
const LiveSpace = dynamic(() => import("@/components/LiveSpace"), { ssr: false });

const LivePageAtHandle: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  clubSpaceObject,
}: {
  clubSpaceObject: ClubSpaceObject | undefined;
}) => {
  const {
    query: { handle },
    reload,
  } = useRouter();
  const { address, isConnected } = useAccount();
  const { data: profilesResponse, isLoading: isLoadingProfiles } = useGetProfilesOwned({}, address);
  const { data: ensData, isLoading: isLoadingENS } = useENS(address);
  const [defaultProfile, setDefaultProfile] = useState<Profile>();
  const [loadingDefaultProfile, setLoadingDefaultProfile] = useState(true);
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const [audioPlayerState, audioPlayerDispatch] = useReducer(playerReducer, playerInitialState);
  const { data: hasBadge, isLoading: isLoadingBadge } = useHasBadge();
  const [ensDone, setEnsDone] = useState(false);

  useEffect(() => {
    if (!isLoadingProfiles) {
      setDefaultProfile(profilesResponse ? profilesResponse.defaultProfile : null);
      setLoadingDefaultProfile(false);
    }
  }, [address, isLoadingProfiles]);

  useEffect(() => {
    if (!address || !isLoadingENS) {
      setEnsDone(true);
    }
  }, [isLoadingENS]);

  return (
    <>
      <NextSeo
        title={`ClubSpace | ${clubSpaceObject.creatorLensHandle}`}
        description={`Join @${clubSpaceObject.creatorLensHandle} at their live listening party now!`}
        openGraph={{
          url: `${NEXT_PUBLIC_SITE_URL}/live/${clubSpaceObject.creatorLensHandle}`,
          title: `ClubSpace | ${clubSpaceObject.creatorLensHandle}`,
          description: `Join @${clubSpaceObject.creatorLensHandle} at their live listening party now!`,
          images: [
            {
              url: "https://link.storjshare.io/raw/jwg3vujynjlvbn5gdgm5yjoob7mq/misc%2Fclubspace.png",
              width: 1200,
              height: 630,
              type: "image/png",
              alt: "clubspace.png",
            },
          ],
        }}
        additionalLinkTags={[
          {
            rel: "iframely player audio",
            type: "text/html",
            href: `${NEXT_PUBLIC_SITE_URL}/embed/${clubSpaceObject.creatorLensHandle}`,
            media: "(aspect-ratio: 2/1)",
          },
        ]}
      />
      {isLoadingEntry && clubSpaceObject.queuedTrackIds?.length ? (
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
      {!loadingDefaultProfile && ensDone && (!isLoadingBadge || !address) && clubSpaceObject.queuedTrackIds?.length ? (
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

  if (!handle || handle === "<no source>")
    return {
      notFound: true,
    };

  try {
    const clubSpaceObject = await getLiveClubspace(handle as string);
    if (!clubSpaceObject) {
      console.log("SPACE NOT FOUND! MAY HAVE EXPIRED FROM REDIS");
      return {
        notFound: true,
      };
    }

    console.log(`found space with id: ${clubSpaceObject.clubSpaceId}`);
    // console.log(clubSpaceObject);

    return { props: { clubSpaceObject } };
  } catch (error) {
    console.log(error);
  }

  return {
    notFound: true,
  };
};
