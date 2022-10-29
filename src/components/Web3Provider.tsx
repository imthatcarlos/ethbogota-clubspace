import { useTheme } from "next-themes";
import { createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { getDefaultWallets, RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { chain, configureChains } from "wagmi";
import { useEffect, useMemo, useState } from "react";

export const { chains, provider } = configureChains(
  [
    chain.polygon,
    chain.polygonMumbai,
    chain.mainnet
  ],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY })
  ]
);

export const { connectors } = getDefaultWallets({
  appName: "ClubSpace",
  chains,
});

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const Web3Provider = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = useMemo(
    () =>
      resolvedTheme === "dark"
        ? darkTheme({ accentColor: "#4f46e5", borderRadius: "small" })
        : lightTheme({ accentColor: "#4f46e5", borderRadius: "small" }),
    [resolvedTheme]
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
