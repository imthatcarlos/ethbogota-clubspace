import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {useAccount} from 'wagmi';
import { JamProvider, jamConfig } from '@madfi/clubspace-sdk';
import Clubspace from './Clubspace';
import { ConnectWallet } from './ConnectWallet';
import Web3Provider from "./Web3Provider";

const App = () => {
  const { isConnected, address } = useAccount();
  return (
    <Web3Provider>
      <JamProvider options={{ jamConfig }}>
        <h1>Clubspace Lite</h1>
        <div className="connect md:right-5 xs:relative">
          <div className="md:flex gap-4 justify-center md:min-w-[250px] scale-[0.8] xs:scale-100">
            <div className="mb-2 sm:mb-0">
              {!isConnected && <ConnectWallet showBalance={false} />}
            </div>
          </div>
        </div>
        {isConnected && <Clubspace />}
      </JamProvider>
    </Web3Provider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
