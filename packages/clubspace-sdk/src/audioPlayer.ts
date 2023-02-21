import { ITrack, IClubSpaceObject } from './types';
import { groupBy } from 'lodash';
import IcecastMetadataPlayer from 'icecast-metadata-player';

interface PlayerOptions {
  playbackMethod?: 'mediasource' | 'webaudio' | 'html5' | undefined;
  onTrackChanged: (newTrack: ITrack) => void;
  onSpaceEnded: () => void;
}

interface MetadataProps {
  StreamTitle?: string;
}

/**
 * Returns an audio player that handles an icecast stream with real-time metadata updates
 * https://www.npmjs.com/package/icecast-metadata-player
 */
export const getAudioPlayer = async (
  clubSpaceObject: IClubSpaceObject,
  playlistTracks: ITrack[],
  { playbackMethod, onTrackChanged, onSpaceEnded }: PlayerOptions
) => {
  const { streamURL, queuedTrackIds } = clubSpaceObject;
  const currentTrackId = queuedTrackIds[0];

  const groupedPlaylistTracks = groupBy(playlistTracks, 'id');

  const onMetadata = (metadata: MetadataProps) => {
    if (metadata.StreamTitle === currentTrackId) return; // ignore first event

    if (!metadata || !metadata.StreamTitle) {
      onSpaceEnded();
    } else {
      onTrackChanged(groupedPlaylistTracks[metadata.StreamTitle][0]);
    }
  };

  const onError = (message: string, error: any) => {
    console.log(`clubspace-sdk::audioPlayer:: onError: ${message}`, error);
  };

  return new IcecastMetadataPlayer(streamURL, {
    playbackMethod,
    onMetadata,
    onError,
  });
};
