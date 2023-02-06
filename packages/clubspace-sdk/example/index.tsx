import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { metadataHook, getClubSpace } from '../src/index';

const CLUBSPACE_ID = '0x123';

const App = () => {
  const [clubspace, setClubspace] = React.useState<any>();
  React.useEffect(() => {
    getClubSpace(CLUBSPACE_ID).then((data) => setClubspace(data));
  }, []);

  const { currentTrack, nextTrack, streamEnded, onMetadata } = metadataHook(
    clubspace.playlistTracks,
    clubspace.queuedTrackIds,
    clubspace.currentTrackId
  );

  return (
    <div>
      <p>
        {currentTrack?.title} - {currentTrack?.artist.name}
      </p>
      <p>
        {nextTrack?.title} - {nextTrack?.artist.name}
      </p>
      <p>{streamEnded ? 'Ended' : 'Live'}</p>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
