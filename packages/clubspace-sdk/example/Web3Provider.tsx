import { createClient, WagmiConfig } from "wagmi";
import { getDefaultWallets, RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { chain, configureChains } from "wagmi";
import { publicProvider } from 'wagmi/providers/public'
import * as React from 'react';

export const { chains, provider } = configureChains(
  [chain.polygon, chain.mainnet, chain.optimism],
  [publicProvider()],
);

export const { connectors } = getDefaultWallets({
  appName: "ClubSpace Lite",
  chains,
});

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const Web3Provider = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const theme = React.useMemo(
    () => lightTheme({ accentColor: "#FE202B", borderRadius: "small" }),
    []
  );
  if (!mounted) return null;
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={theme}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default Web3Provider;
