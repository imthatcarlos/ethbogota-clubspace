import { useTheme } from "next-themes";
import { createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { getDefaultWallets, RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { chain, configureChains } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { IS_PRODUCTION, JSON_RPC_URL_ALCHEMY_MAP } from "@/lib/consts";

export const { chains, provider } = configureChains(
  IS_PRODUCTION ? [chain.polygon, chain.mainnet, chain.optimism] : [chain.polygon, chain.polygonMumbai, chain.goerli],
  // IS_PRODUCTION ? [chain.polygon] : [chain.polygonMumbai],
  [jsonRpcProvider({ rpc: (chain) => ({ http: JSON_RPC_URL_ALCHEMY_MAP[chain.id] }) })]
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
    () => darkTheme({ accentColor: "#FE202B", borderRadius: "small" }),
    // resolvedTheme === "dark"
    // ? darkTheme({ accentColor: "#FE202B", borderRadius: "small" })
    // : lightTheme({ accentColor: "#4f46e5", borderRadius: "small" }),
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
