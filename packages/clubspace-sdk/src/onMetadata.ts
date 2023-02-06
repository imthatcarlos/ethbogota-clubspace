import { useEffect, useMemo, useState } from 'react';
import { ITrack } from './types';
import { groupBy } from 'lodash/collection';
// import { logOverwriteAction } from '@madfi/ts-sdk';
// import { fieldNamePrivy } from './utils';

export const metadataHook = (
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
    }
  };

  return { currentTrack, nextTrack, streamEnded, onMetadata };
};
