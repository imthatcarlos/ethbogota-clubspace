import { Slider } from "@/components/Slider";
import { SpaceEnded } from "@/components/SpaceEnded";
import { LENSTER_URL, NEXT_PUBLIC_SITE_URL } from "@/lib/consts";
import { useGetProfilesByHandles } from "@/services/lens/getProfile";
import { GetServerSideProps } from "next";

import { useRouter } from "next/router";
import type { IClubSpaceObject, ITrack } from "packages/clubspace-sdk/src";
import { useEffect, useMemo, useRef, useState } from "react";
import { NextPageWithLayout } from "../_app";

const AUDIO_PLAYER_DEFAULT_PLAYBACK = "html5";

const EmbedSpace: NextPageWithLayout = ({
  clubSpaceObject,
  playlistTracks,
  handle,
}: {
  clubSpaceObject: IClubSpaceObject;
  playlistTracks: ITrack[];
  handle: string;
}) => {
  const [hasSpaceEnded, setHasSpaceEnded] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<ITrack>();
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<any | null>(null);

  const spaceEndedDate = useMemo(() => new Date(clubSpaceObject?.endAt * 1000), [clubSpaceObject?.endAt]);
  const currentTrackImage = useMemo(() => {
    // some tracks don't have avatarUrl
    return currentTrack?.artist?.profiles?.sound?.avatarUrl;
  }, [currentTrack]);

  const { data: hostLensData, isLoading: loadingLensData } = useGetProfilesByHandles({ enabled: !!handle }, [
    handle as string,
  ]);

  const play = () => {
    if (!audioRef.current) return;

    if (audioRef.current.state !== "playing") {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.stop();
    setPlaying(false);
  };

  const setVolume = (volume: number) => {
    if (volume < 0 || volume > 1) throw new Error("volume must be between 0..1");

    audioRef.current.audioElement.volume = volume;
  };

  useEffect(() => {
    if (handle && clubSpaceObject) {
      const fetchData = async () => {
        // force imports on client
        const { getAudioPlayer } = await import("packages/clubspace-sdk/src/audioPlayer");
        
        audioRef.current = await getAudioPlayer(clubSpaceObject, playlistTracks, {
          playbackMethod: AUDIO_PLAYER_DEFAULT_PLAYBACK,
          onTrackChanged: (track) => setCurrentTrack(track),
          onSpaceEnded: () => setHasSpaceEnded(true),
        });
      };

      fetchData().finally(() => setLoading(false));
    } else {
      setLoading(false);
      setHasSpaceEnded(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  useEffect(() => {
    // check every 30 seconds if the space has ended
    // not very expensive, no other way to tell react to re-render when time changes
    // we could also check for response from streamURL
    const interval = setInterval(() => {
      if (spaceEndedDate < new Date()) {
        setHasSpaceEnded(true);
      }
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [spaceEndedDate]);

  if (hasSpaceEnded) {
    return <SpaceEnded handle={handle as string} />;
  }

  if (loadingLensData || loading)
    return (
      <div className="grid place-items-center w-screen h-screen">
        <span className="relative isolate inline-flex items-center justify-center">
          <span className="absolute z-0 h-12 w-12 animate-scale rounded-full bg-[#d1156f29]"></span>
          <span className="absolute z-10 h-12 w-12 animate-scale rounded-full bg-[#d1156f29] animation-delay-1000"></span>
        </span>
      </div>
    );

  return (
    <div className="relative w-full h-screen">
      {/* <NextSeo
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
        /> */}
      {/* <pre>
          <code>{JSON.stringify(currentTrack, null, 2)}</code>
        </pre> */}

      {/* <pre>
          <code>{JSON.stringify(clubSpaceObject, null, 2)}</code>
        </pre> */}

      {!hasSpaceEnded && (
        <div className="w-full h-full flex flex-col gap-2 p-8">
          <div className="w-full h-full flex items-center justify-center gap-4">
            <div className="w-full h-full flex flex-col gap-4">
              <div className="relative xs:max-h-[calc(100%-60px)] flex items-center justify-center">
                <img
                  src={currentTrackImage || hostLensData?.[0]?.picture?.uri}
                  alt={currentTrackImage ? `${currentTrack.title} banner` : `${handle} profile pic`}
                  className="object-contain h-full aspect-square rounded self-center"
                  draggable="false"
                />
              </div>
              {/* test adding the ref and updating the sdk if doesn't work */}
              <audio className="hidden invisible" id="backup-audio"></audio>
              <div className="flex gap-2 items-center justify-center w-full">
                <button
                  onClick={() => {
                    if (!audioRef.current) return;
                    if (audioRef.current.state !== "playing") return play();
                    return pause();
                  }}
                >
                  {playing ? (
                    <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
                      <g strokeWidth="0"></g>
                      <g strokeLinecap="round" strokeLinejoin="round"></g>
                      <g>
                        <path
                          opacity="0.1"
                          d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                          fill="#ffffff"
                        ></path>
                        <path
                          d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                          stroke="#ffffff"
                          strokeWidth="2"
                        ></path>
                        <path
                          d="M14 9L14 15"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M10 9L10 15"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </g>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="#ffffff" className="w-12 h-12">
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                      <g id="SVGRepo_iconCarrier">
                        <rect id="view-box" width="24" height="24" fill="none"></rect>
                        <path
                          id="Shape"
                          d="M0,9.75A9.75,9.75,0,1,1,9.75,19.5,9.761,9.761,0,0,1,0,9.75Zm1.5,0A8.25,8.25,0,1,0,9.75,1.5,8.259,8.259,0,0,0,1.5,9.75Zm5.75-3.8,7,3.8-7,3.8Z"
                          transform="translate(2.25 2.25)"
                          fill="#ffffff"
                        ></path>
                      </g>
                    </svg>
                  )}
                </button>
                <Slider
                  defaultValue={[50]}
                  max={100}
                  step={1}
                  onValueChange={(volumeArr) => (audioRef.current.audioElement.volume = volumeArr[0] / 100)}
                  aria-label="Volume"
                  className="w-full h-5"
                />
              </div>
            </div>
            <div className="w-full h-full flex flex-col justify-center items-center gap-4">
              {currentTrack && (
                <p className="text-center">
                  {currentTrack?.title} - {currentTrack?.artist?.name}
                </p>
              )}
              <a href={`${LENSTER_URL}/u/${handle}`} rel="noopener noreferrer" target="_blank">
                Follow @{handle}
              </a>
            </div>
          </div>
          <span className="flex gap-1 items-center">
            <a
              href={`${NEXT_PUBLIC_SITE_URL}/live/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline"
            >
              {clubSpaceObject.stats.activeUsersInRoomCount} people connected to the space. Join them
            </a>
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4">
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  stroke="#ffffff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2 10h16m0 0l-7-7m7 7l-7 7"
                ></path>
              </g>
            </svg>
          </span>
        </div>
      )}
    </div>
  );
};

EmbedSpace.getLayout = (page) => <>{page}</>;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { handle },
  } = context;

  if (!handle || handle === "<no source>") return { notFound: true };
  // can only import the exact path bc otherwise it would trigger the import of the whole package
  // and getAudioPlayer needs to be on the client
  const { getClubSpace } = await import("packages/clubspace-sdk/src/fetchData");

  try {
    const { clubSpaceObject, playlistTracks } = await getClubSpace(handle as string);
    if (!clubSpaceObject) {
      console.log("SPACE NOT FOUND! MAY HAVE EXPIRED FROM REDIS");
      return {
        // we need to have the handle in the _app when there's no space
        // to provide the correct iframely link
        props: { handle },
      };
    }

    console.log(`found space with id: ${clubSpaceObject.clubSpaceId}`);
    // console.log(clubSpaceObject);

    return { props: { clubSpaceObject, playlistTracks, handle } };
  } catch (error) {
    console.log(error);
  }

  return {
    props: {
      handle,
    },
  };
};

export default EmbedSpace;
