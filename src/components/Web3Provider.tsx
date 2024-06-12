import { WagmiProvider } from 'wagmi'
import {  RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { useEffect, useMemo, useState } from "react";
import { ToastBar, Toaster } from "react-hot-toast";
import LensProvider from "@/pages/LensProvider";
import { appInfo, wagmiConfig } from "@/lib/utils/rainbow";

const Web3Provider = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  const rainbowTheme = useMemo(() => {
    return darkTheme();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider theme={rainbowTheme} appInfo={appInfo}>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              backgroundColor: rainbowTheme.colors.modalBackground,
              color: "white",
            }
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <>
                  {icon}
                  {message}
                </>
              )}
            </ToastBar>
          )}
        </Toaster>
        <LensProvider>
          {children}
        </LensProvider>
      </RainbowKitProvider>
    </WagmiProvider>
  );
};

export default Web3Provider;
