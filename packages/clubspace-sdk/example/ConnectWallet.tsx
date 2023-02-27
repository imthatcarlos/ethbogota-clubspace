import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ConnectButtonProps } from "@rainbow-me/rainbowkit/dist/components/ConnectButton/ConnectButton";
import * as React from 'react';

export const ConnectWallet: React.FC<ConnectButtonProps> = ({ ...rest }) => {
  return <ConnectButton accountStatus="address" chainStatus="icon" {...rest} />;
};
