import "tailwindcss/tailwind.css";
import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";
import "@/styles/fonts.css";
import { ThemeProvider } from "next-themes";
import Web3Provider from "@/components/Web3Provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast, Toaster, ToastBar } from "react-hot-toast";
import { Header } from '@/components/Header';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24,
    },
  },
});

const App = ({ Component, pageProps }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <Web3Provider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                backgroundColor: "#000",
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
          <Header />
          <Component {...pageProps} />
        </Web3Provider>
      </ThemeProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
