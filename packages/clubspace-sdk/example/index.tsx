import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { JamProvider } from '../src/jam-core-react';
import { jamConfig } from '../src/consts';
import Clubspace from './Clubspace';

const App = () => {
  return (
    <JamProvider options={{ jamConfig }}>
      <h1>Clubspace Lite</h1>
      <Clubspace />
    </JamProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
