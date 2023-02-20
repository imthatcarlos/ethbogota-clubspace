import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { LiveAudioPlayer, getClubSpace } from '../src/index';

const HANDLE = 'bananatime.test';

const App = () => {
  const [clubSpaceObject, setClubspace] = React.useState<any>();
  const [playlistTracks, setPlaylistTracks] = React.useState<any>([]);

  React.useEffect(() => {
    getClubSpace(HANDLE).then(({ clubSpaceObject, playlistTracks }) => {
      setClubspace(clubSpaceObject);
      setPlaylistTracks(playlistTracks);
    });
  }, []);

  return (
    <>
      <h1>Clubspace Lite</h1>
      <div>
        {playlistTracks.map(p => (
          <span key={p.id}>{p.title} - </span>
        ))}
      </div>
      {clubSpaceObject && playlistTracks.length > 0 && (
        <LiveAudioPlayer
          clubSpaceObject={clubSpaceObject}
          playlistTracks={playlistTracks}
        />
      )}
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
