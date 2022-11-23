import React, { useState, useMemo, useEffect, useRef } from "react";
import { AudioPlayer } from "decent-audio-player";
import { ITrack } from "@spinamp/spinamp-sdk";
import IcecastMetadataPlayer from "icecast-metadata-player";
import { groupBy } from "lodash/collection";
import { isEmpty } from "lodash/lang";
import { getUrlForImageFromIpfs } from "@/utils/ipfs";
import { ExternalLink, Play, Pause } from "@/components/Vectors";
import useIsMounted from "@/hooks/useIsMounted";

interface Props {
  streamURL: string;
  playlistTracks: ITrack[];
  currentTrackId?: string;
};

// @TODO: will we have feedback from the audio player api of the current track?
export const LiveAudioPlayer = ({ streamURL, playlistTracks, currentTrackId }: Props) => {
  const isMounted = useIsMounted();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<ITrack | undefined>();
  const [streamEnded, setStreamEnded] = useState<boolean>(false);

  const onMetadata = (metadata) => {
    if (!metadata) {
      setStreamEnded(true);
    } else {
      setCurrentTrack(groupedPlaylistTracks[metadata.StreamTitle][0]);
    }
  };

  const player = useRef(new IcecastMetadataPlayer(streamURL, { onMetadata }));

  const groupedPlaylistTracks = useMemo(() => groupBy(playlistTracks, 'id'), [playlistTracks]);

  useEffect(() => {
    if (isMounted) {
      if (currentTrackId) {
        setCurrentTrack(groupedPlaylistTracks[currentTrackId][0]);
      } else {
        setStreamEnded(true);
        return;
      }
    }
  }, [isMounted]);

  const togglePlaying = async () => {
    if (isPlaying) {
      await player.current.stop();
    } else {
      await player.current.play();
    }

    setIsPlaying(!isPlaying);
  }

  // @TOOD: handle render when `streamEnded`

  return (
    <div className="flex gap-x-4">
      {
        /**
        <AudioPlayer
          size={56}
          audioSrc={streamURL}
          callbackAfterPlay={() => {
            console.log("callbackAfterPlay");
          }}
          active
        />
        */
      }
      <button onClick={togglePlaying}>
        {
          !isPlaying
            ? <Play />
            : <Pause />
        }
      </button>
      <div className="song-details flex flex-col gap-y-2 justify-center">
        <span className="text-xl">
          <a
            href={currentTrack?.websiteUrl}
            title="Visit song source"
            className="flex gap-x-[10px] items-center group"
            target="_blank"
          >
            {currentTrack?.title || ""}
            <div>
              <ExternalLink />
            </div>
          </a>
        </span>
        <span className="text-lg text-gray-400">{currentTrack?.artist?.name || ""}</span>
      </div>
    </div>
  );
};
