import React, { useState, useMemo, useEffect } from 'react';
import { ITrack } from './types';
import { IcecastPlayer } from '@madfi/ux-components';
import { groupBy } from 'lodash';
import useIsMounted from './useIsMounted';
import { use, useJam } from './jam-core-react';

interface Props {
  clubSpaceObject: any;
  playlistTracks: ITrack[];
}

export const LiveAudioPlayer = ({ clubSpaceObject, playlistTracks }: Props) => {
  const { streamURL, queuedTrackIds } = clubSpaceObject;
  const currentTrackId = queuedTrackIds[0];

  const isMounted = useIsMounted();
  const [state, { setProps, retryAudio }] = useJam();
  const [currentTrack, setCurrentTrack] = useState<ITrack | undefined>();
  const [nextTrack, setNextTrack] = useState<ITrack | undefined>();
  const [streamEnded, setStreamEnded] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  let [audioPlayError] = use(state, ['audioPlayError']);

  const onMetadata = (metadata: any) => {
    if (
      metadata.StreamTitle === currentTrack?.id ||
      metadata.StreamTitle === currentTrackId
    )
      return; // ignore first event

    if (!metadata || !metadata.StreamTitle) {
      setStreamEnded(true);
      setCurrentTrack(undefined);
      setNextTrack(undefined);
    } else {
      setCurrentTrack(groupedPlaylistTracks[metadata.StreamTitle][0]);

      if (
        currentTrackIndex + 1 <= queuedTrackIds.length &&
        queuedTrackIds[currentTrackIndex + 1]
      ) {
        const nextTrackId = queuedTrackIds[currentTrackIndex + 1];
        setNextTrack(groupedPlaylistTracks[nextTrackId][0]);
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setNextTrack(undefined);
      }
    }
  };

  const groupedPlaylistTracks = useMemo(() => groupBy(playlistTracks, 'id'), [
    playlistTracks,
  ]);

  useEffect(() => {
    if (isMounted()) {
      if (currentTrackId) {
        setCurrentTrack(groupedPlaylistTracks[currentTrackId][0]);
        if (queuedTrackIds.length > 1) {
          const nextTrackId = queuedTrackIds[currentTrackIndex + 1];
          setNextTrack(groupedPlaylistTracks[nextTrackId][0]);
        }
      } else {
        setStreamEnded(true);
        return;
      }
    }
  }, [isMounted]);

  // use first press of `play` to enable audio player for host mic
  const onPlay = () => {
    if (audioPlayError) {
      setProps('userInteracted', true);
      retryAudio();
    }
    setProps('forceSoundMuted', false);
  };

  // stop receiving audio
  const onPause = () => {
    setProps('forceSoundMuted', true);
  };

  if (streamEnded) return null;

  return (
    <IcecastPlayer
      streamURL={streamURL}
      currentSong={{
        songUrl: currentTrack?.websiteUrl,
        project: currentTrack?.title,
        website: currentTrack?.websiteUrl,
        artist: currentTrack?.artist?.name,
        image: currentTrack?.lossyArtworkUrl,
      }}
      nextSong={{
        songUrl: nextTrack?.websiteUrl,
        project: nextTrack?.title,
        website: nextTrack?.websiteUrl,
        artist: nextTrack?.artist?.name,
        image: nextTrack?.lossyArtworkUrl,
      }}
      options={{ playbackMethod: 'html5' }}
      // @ts-ignore
      callbackOnMetadata={onMetadata}
      callbackOnPlay={onPlay}
      callbackOnPause={onPause}
    />
  );
};
