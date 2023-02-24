import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { getAudioPlayer, getClubSpace, ITrack } from '../src/index';

const HANDLE = 'carlosbeltran.test';
const AUDIO_PLAYER_DEFAULT_PLAYBACK = 'html5';

const App = () => {
  const [clubSpace, setClubspace] = React.useState<any>();
  const [playlistTracks, setPlaylistTracks] = React.useState<any>([]);
  const [currentTrack, setCurrentTrack] = React.useState<ITrack>();
  const [spaceEnded, setSpaceEnded] = React.useState<boolean>(false);

  const audioPlayer = React.useRef<any>(null);

  React.useEffect(() => {
    const _fetchData = async () => {
      const { clubSpaceObject, playlistTracks } = await getClubSpace(HANDLE);

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
      console.log('audioPlayer.current', audioPlayer.current);
    };

    _fetchData();
  }, []);

  const play = () => {
    if (!audioPlayer.current) return;
    audioPlayer.current.play();
  };

  const pause = () => {
    if (!audioPlayer.current) return;
    // audioPlayerDispatch(setAudioVolumeAction(volume));
  };

  return (
    <>
      <h1>Clubspace Lite</h1>
      <div>
        <h2>All Tracks</h2>
        {playlistTracks.map(p => (
          <span key={p.id}>{p.title} - </span>
        ))}
      </div>
      <div>
        {spaceEnded ? (
          <h2>Space has ended</h2>
        ) : (
          <>
            <h2>Playing</h2>
            <div>{`${currentTrack?.title} - ${currentTrack?.artist?.name}`}</div>
            <button onClick={play}>Play</button>
            <br />
            <button onClick={pause}>Pause</button>
          </>
        )}
      </div>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
