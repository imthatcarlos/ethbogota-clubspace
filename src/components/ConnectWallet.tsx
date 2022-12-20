import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ConnectButtonProps } from "@rainbow-me/rainbowkit/dist/components/ConnectButton/ConnectButton";
import { FC } from "react";

export const ConnectWallet: FC<ConnectButtonProps> = ({ ...rest }) => {
  return <ConnectButton accountStatus="address" chainStatus="icon" {...rest} />;
};
