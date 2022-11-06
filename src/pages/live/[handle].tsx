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
  const hasSongEnded = useRef(false);

  if (!clubSpaceObject) {
    push("/404");
    return;
  }

  const { data: playlists } = useQuery(
    ["playlist", clubSpaceObject],
    () => fetchPlaylistById(clubSpaceObject.spinampPlaylistId),
    {
      enabled: !!clubSpaceObject,
    }
  );

  const { data: durations } = useQuery(["playlist-durations", clubSpaceObject.spinampPlaylistId], () =>
    Promise.all(
      playlists.playlistTracks.map(async (track) => {
        const context = new AudioContext();

        const res = await fetch(track.lossyAudioUrl);

        // get duration from audio from response
        const audioBuffer = await res.arrayBuffer();
        const audioBufferSourceNode = context.createBufferSource();
        audioBufferSourceNode.buffer = await context.decodeAudioData(audioBuffer);
        const duration = audioBufferSourceNode.buffer.duration;

        return duration;
      }, 0)
    )
  );

  const wholePlaylistDuration = durations?.reduce((prev, curr) => prev + curr, 0);

  let currentTrackIndex = Math.floor((Date.now() - clubSpaceObject.createdAt) / wholePlaylistDuration);
  // normalize currentTrackIndex to be within playlistTracks length
  const currentTrack = useMemo(
    () => playlists?.playlistTracks[currentTrackIndex % playlists.playlistTracks.length],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentTrackIndex, playlists, hasSongEnded]
  );

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
              audio={currentTrack?.lossyAudioUrl}
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
