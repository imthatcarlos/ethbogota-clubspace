import 'react-app-polyfill/ie11';
import * as React from 'react';
import { useAccount, useSigner } from 'wagmi';
import { exampleSpaceData } from './utils';
import {
  createClubSpace,
  getAudioPlayer,
  getProfilesOwned,
  getClubSpace,
  ITrack,
  ILensProfile
} from './../src';

const AUDIO_PLAYER_DEFAULT_PLAYBACK = 'html5';

const ClubSpace = () => {
  const { isConnected, address } = useAccount();
  const { data: signer } = useSigner();
  const [clubSpace, setClubspace] = React.useState<any>();
  const [playlistTracks, setPlaylistTracks] = React.useState<any>([]);
  const [currentTrack, setCurrentTrack] = React.useState<ITrack>();
  const [spaceEnded, setSpaceEnded] = React.useState<boolean>(false);
  const [previousVolume, setPreviousVolume] = React.useState<number>(0.5);
  const [lensProfile, setLensProfile] = React.useState<ILensProfile>();

  const audioPlayer = React.useRef<any>(null);

  const { create } = createClubSpace();

  React.useEffect(() => {
    const _fetchData = async () => {
      const profiles = await getProfilesOwned(address);

      if (!profiles.length) return;
      setLensProfile(profiles[0]);

      const { clubSpaceObject, playlistTracks } = await getClubSpace(profiles[0].handle);
      if (!clubSpaceObject) return;

      setClubspace(clubSpaceObject);
      setPlaylistTracks(playlistTracks);

      audioPlayer.current = await getAudioPlayer(
        clubSpaceObject,
        playlistTracks,
        {
          playbackMethod: AUDIO_PLAYER_DEFAULT_PLAYBACK,
          onTrackChanged: track => setCurrentTrack(track),
          onSpaceEnded: () => setSpaceEnded(true),
        }
      );
    };

    if (isConnected) {
      _fetchData();
    }
  }, [isConnected]);

  const play = () => {
    if (!audioPlayer.current) return;

    if (audioPlayer.current.state !== 'playing') {
      audioPlayer.current.play();
    }

    if (previousVolume) {
      audioPlayer.current.audioElement.volume = previousVolume;
    }
  };

  const pause = () => {
    if (!audioPlayer.current) return;

    setPreviousVolume(audioPlayer.current.audioElement.volume);

    audioPlayer.current.audioElement.volume = 0;
  };

  const setVolume = (volume: number) => {
    if (volume < 0 || volume > 1)
      throw new Error('volume must be between 0..1');

    audioPlayer.current.audioElement.volume = volume;
  };

  const _create = async () => {
    const res = await create(
      exampleSpaceData,
      process.env.REACT_APP_CLUBSPACE_API_KEY,
      signer,
      lensProfile,
    );
    console.log('clubspace data', res);
    window.location.reload();
  };

  return (
    <>
      <button onClick={() => _create()}>Create Clubspace</button>
      {clubSpace && (
        <>
          <div>
            <h2>All Tracks</h2>
            {playlistTracks.map(p => (
              <div key={p.id}>
                <span key={p.id}>{`${p.title} - ${p.artist?.name}`}</span>
                <br />
              </div>
            ))}
          </div>
          <div>
            {spaceEnded || clubSpace?.ended ? (
              <>
                <h2>Space has ended</h2>
              </>
            ) : (
              <>
                <h2>Playing Live [click to listen]</h2>
                <div>{`${currentTrack?.title} - ${currentTrack?.artist?.name}`}</div>
                <button onClick={play}>Play</button>
                <br />
                <button onClick={pause}>Pause</button>
                <br />
                <h2>{`Listening on joinclubspace.xyz: ${clubSpace.stats.activeUsersInRoomCount}`}</h2>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ClubSpace;
