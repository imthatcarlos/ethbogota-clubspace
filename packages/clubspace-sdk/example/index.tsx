import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { LiveAudioPlayer, getClubSpace, use, useJam } from '../src/index';

const CLUBSPACE_ID = '0x123';

const App = () => {
  const [clubSpaceObject, setClubspace] = React.useState<any>();
  React.useEffect(() => {
    getClubSpace(CLUBSPACE_ID).then(data => setClubspace(data));
  }, []);

  const [state] = useJam();
  let [audioPlayError] = use(state, ['audioPlayError']);

  return (
    <div>
      <LiveAudioPlayer
        playlistTracks={clubSpaceObject.playlistTracks}
        streamURL={clubSpaceObject.streamURL}
        queuedTrackIds={clubSpaceObject.queuedTrackIds}
        currentTrackId={clubSpaceObject.queuedTrackIds[0]}
        jamAudioPlayError={audioPlayError}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
