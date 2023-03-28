import { Slider } from "@/components/Slider";
import { SpaceEnded } from "@/components/SpaceEnded";
import { LENSTER_URL, NEXT_PUBLIC_SITE_URL } from "@/lib/consts";
import { useGetProfilesByHandles } from "@/services/lens/getProfile";
import { GetServerSideProps } from "next";
import { Transition } from "@headlessui/react";
import ClubspaceNeonHeader from "@/assets/svg/clubspace-neon-header.svg";
import { getUrlForImageFromIpfs } from "@/utils";

import type { IClubSpaceObject, ITrack } from "packages/clubspace-sdk/src";
import { SVGProps, useEffect, useMemo, useRef, useState } from "react";
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
  const [showVolume, setShowVolume] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<ITrack>();
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
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
    <div className="relative w-full h-[100dvh]">
      {!hasSpaceEnded && (
        <>
          {/* test adding the ref and updating the sdk if doesn't work */}
          <audio className="hidden invisible" id="backup-audio"></audio>
          <div className="w-full h-full max-h-full flex flex-col gap-2 py-8">
            <div className="w-full h-[90%] max-h-full flex gap-4 px-8">
              {/* image */}
              <div className="w-full min-w-[50%] h-auto">
                {/* shimmer effect when image is loading */}
                {!imageLoaded && (
                  <div
                    className={`h-full max-w-[85%] rounded relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-rose-100/10 before:to-transparent isolate overflow-hidden shadow-xl shadow-black/5 before:border-t before:border-rose-100/10`}
                  ></div>
                )}
                <img
                  src={currentTrackImage || hostLensData?.[0]?.picture?.uri}
                  alt={currentTrackImage ? `${currentTrack.title} banner` : `${handle} profile pic`}
                  className={`object-contain h-full aspect-square rounded self-center ${!imageLoaded && "hidden"}`}
                  draggable="false"
                  loading="eager"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
              {/* name - follow */}
              <div className="w-full flex flex-col gap-1">
                <ClubspaceNeonHeader height={80} width={130} className="place-self-end" />
                {currentTrack && (
                  <p className="text-left font-semibold text-4xl">
                    {currentTrack?.title}
                  </p>
                )}
                <a
                  href={currentTrack?.websiteUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 text-lg"
                >
                  {currentTrack?.artist?.name}
                </a>

                <div className="mx-auto bg-almost-black !text-white flex gap-x-2 relative justify-between items-center">
                  <img
                    className="w-8 h-8 rounded-full outline outline-offset-0 outline-1 outline-gray-50"
                    src={hostLensData?.[0]?.picture?.uri ? hostLensData?.[0]?.picture?.uri : getUrlForImageFromIpfs(hostLensData?.[0]?.picture?.original?.url)}
                    alt=""
                  />
                  <span>@{hostLensData?.[0]?.handle}</span>
                </div>

                {/* Checkout live */}
                <span className="flex flex-col gap-1 mt-1 items-center">
                  {clubSpaceObject.stats.activeUsersInRoomCount} people connected to the space.
                  <a
                    href={`${NEXT_PUBLIC_SITE_URL}/live/${handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline btn !bg-[#d1157083]"
                  >
                    <span className="whitespace-nowrap flex items-center gap-2 text-white">
                      Join them <ArrowRight className="w-4 h-4 inline" />
                    </span>
                  </a>
                </span>
              </div>
            </div>
            {/* Play - slider */}
            <div className="flex gap-2 items-center justify-center w-full px-6">
              <button
                onClick={() => {
                  if (!audioRef.current) return;
                  if (audioRef.current.state !== "playing") return play();
                  return pause();
                }}
              >
                {!playing ? <PlayingIcon className="w-8 h-8" /> : <PauseIcon className="w-8 h-8" />}
              </button>
              <div className="flex items-center w-full">
                <VolumeIcon
                  className="w-12 h-12"
                  onClick={() => {
                    setShowVolume((oldValue) => !oldValue);
                  }}
                />
                <Transition
                  show={showVolume}
                  enter="transition-transform duration-75"
                  enterFrom="scale-0"
                  enterTo="scale-1"
                  leave="transition-transform duration-150"
                  leaveFrom="scale-1"
                  leaveTo="scale-0"
                  className="w-full"
                >
                  <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    onValueChange={(volumeArr) => (audioRef.current.audioElement.volume = volumeArr[0] / 100)}
                    aria-label="Volume"
                    className="w-full h-5"
                  />
                </Transition>
              </div>
            </div>
          </div>
        </>
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

const PlayingIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        <path
          d="M8.286 3.407A1.5 1.5 0 0 0 6 4.684v14.632a1.5 1.5 0 0 0 2.286 1.277l11.888-7.316a1.5 1.5 0 0 0 0-2.555L8.286 3.407z"
          fill="#ffffff"
        ></path>
      </g>
    </svg>
  );
};

const PauseIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="#ffffff"
      viewBox="-5.5 0 32 32"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#ffffff"
      {...props}
    >
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        {" "}
        <title>pause</title>{" "}
        <path d="M0 6.563v18.875c0 0.531 0.438 0.969 0.969 0.969h6.625c0.5 0 0.906-0.438 0.906-0.969v-18.875c0-0.531-0.406-0.969-0.906-0.969h-6.625c-0.531 0-0.969 0.438-0.969 0.969zM12.281 6.563v18.875c0 0.531 0.438 0.969 0.938 0.969h6.625c0.531 0 0.969-0.438 0.969-0.969v-18.875c0-0.531-0.438-0.969-0.969-0.969h-6.625c-0.5 0-0.938 0.438-0.938 0.969z"></path>{" "}
      </g>
    </svg>
  );
};

const ArrowRight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" {...props}>
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        <path
          stroke="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M2 10h16m0 0l-7-7m7 7l-7 7"
        ></path>
      </g>
    </svg>
  );
};

const VolumeIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" {...props}>
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        <g id="ICONS">
          <path
            fill="#ffffff"
            d="M545.8 294.7L363.7 431.5c-1.2.9-2 2.1-2.7 3.3H256v154.5h105c.7 1.2 1.6 2.4 2.7 3.3l182.1 136.7c7.2 5.4 17.5.3 17.5-8.7V303.5c0-9-10.3-14.2-17.5-8.8zM668 691.7c-8.8 0-17.4-4.5-22.2-12.7-7.1-12.2-3-27.9 9.2-35 2.4-1.4 61.7-38.4 61.7-132 0-95-61.1-131.6-61.7-132-12.2-7.1-16.3-22.8-9.2-35 7.1-12.2 22.8-16.3 35-9.2 3.7 2 87.2 52.2 87.2 176.2s-83.5 174.2-87.1 176.2c-4.1 2.4-8.5 3.5-12.9 3.5z"
          ></path>{" "}
          <path
            fill="#ffffff"
            d="M613.2 621.2c-8.8 0-17.4-4.5-22.1-12.7-7.1-12.2-3-27.9 9.2-35 .7-.4 24.6-16 24.6-55.1s-23.9-54.7-25-55.4c-11.8-7.4-15.7-23.1-8.4-35 7.2-12 22.5-16 34.6-9 2 1.2 50 29.9 50 99.4s-48 98.2-50 99.4c-4.1 2.3-8.5 3.4-12.9 3.4z"
          ></path>{" "}
        </g>{" "}
      </g>
    </svg>
  );
};
