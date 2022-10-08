import "tailwindcss/tailwind.css";
import { ThemeProvider } from "next-themes";
import Web3Provider from "@/components/Web3Provider";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import StreamrProvider, { useSubscription } from 'streamr-client-react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24,
    },
  },
});

const App = ({ Component, pageProps }) => {
  let auth;
  // if (typeof window !== "undefined") {
  //   auth = window.ethereum;
  //
  //   // Error: /auth must NOT have additional properties: _events
  //   delete auth._events;
  //
  //   console.log(auth)
  // }
  const streamrClientOptions = { auth };

  return (
    <ThemeProvider attribute="class">
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <StreamrProvider { ...streamrClientOptions }>
            <Component {...pageProps} />
          </StreamrProvider>
        </Web3Provider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
