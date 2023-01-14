import { useEffect, useMemo, useState } from 'react';
import { ITrack } from './types';
import { groupBy } from 'lodash/collection';
import { logOverwriteAction } from '@madfi/ts-sdk';
import { fieldNamePrivy } from './utils';

export const metadataHook = (
  clubSpaceId: string,
  startTime: number,
  playlistTracks: ITrack[],
  queuedTrackIds: [string],
  currentTrackId?: string
) => {
  const [currentTrack, setCurrentTrack] = useState<ITrack | undefined>();
  const [nextTrack, setNextTrack] = useState<ITrack | undefined>();
  const [streamEnded, setStreamEnded] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const groupedPlaylistTracks = useMemo(() => groupBy(playlistTracks, 'id'), [
    playlistTracks,
  ]);

  const updateTimeSpent = (currentTrackIndex: number) => {
    logOverwriteAction(
      // @ts-ignore
      window && window.ethereum ? window.ethereum.selectedAddress : '',
      fieldNamePrivy(clubSpaceId),
      {
        action: 'time_spent',
        songsListened: currentTrackIndex,
        time: Date.now() - startTime,
      },
      'time_spent'
    );
  };

  const onMetadata = (metadata: any) => {
    if (!metadata || !metadata.StreamTitle) {
      setStreamEnded(true);
      setCurrentTrack(undefined);
      setNextTrack(undefined);
    } else {
      if (
        metadata.StreamTitle === currentTrack?.id ||
        metadata.StreamTitle === currentTrackId
      )
        return; // ignore first event

      if (currentTrackIndex + 1 <= queuedTrackIds.length) {
        const nextTrackId = queuedTrackIds[currentTrackIndex + 1];
        setNextTrack(groupedPlaylistTracks[nextTrackId][0]);
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setNextTrack(undefined);
      }

      setCurrentTrack(groupedPlaylistTracks[metadata.StreamTitle][0]);
      setCurrentTrackIndex(currentTrackIndex + 1);
      updateTimeSpent(currentTrackIndex);
    }
  };

  useEffect(() => {
    if (isMounted) {
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

  return { currentTrack, nextTrack, streamEnded, onMetadata };
};
