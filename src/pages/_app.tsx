import "tailwindcss/tailwind.css";
import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import Web3Provider from "@/components/Web3Provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import StreamrProvider from "streamr-client-react";
import { AudioProvider } from "@/components/Providers/AudioProvider";
// import { MetaMaskConnector } from "wagmi/connectors/metaMask";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24,
    },
  },
});

const App = ({ Component, pageProps }) => {
  // const streamrClientOptions = new MetaMaskConnector().getProvider();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <Web3Provider>
          <AudioProvider>
            <Component {...pageProps} />
          </AudioProvider>
        </Web3Provider>
      </ThemeProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
