import "tailwindcss/tailwind.css";
import { ThemeProvider } from "next-themes";
import Web3Provider from "@/components/Web3Provider";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24,
    },
  },
});

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider attribute="class">
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <Component {...pageProps} />
        </Web3Provider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
