import "tailwindcss/tailwind.css";
import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";
import "@/styles/fonts.css";
import { ThemeProvider } from "next-themes";
import { NextSeo } from "next-seo";
import Web3Provider from "@/components/Web3Provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast, Toaster, ToastBar } from "react-hot-toast";
import { Analytics } from '@vercel/analytics/react';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/consts";

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
        <NextSeo
          title="ClubSpace"
          description="Promote your music NFTs with a live listening party"
          openGraph={{
            siteName: "ClubSpace",
            url: SITE_URL,
            title: "ClubSpace",
            description: "Promote your music NFTs with a live listening party",
            images: [
              {
                url: "https://link.storjshare.io/raw/jwg3vujynjlvbn5gdgm5yjoob7mq/misc%2Fclubspace.png",
                width: 1200,
                height: 630,
                type: "image/png",
                alt: "clubspace.png",
              },
            ],
          }}
          twitter={{
            handle: "@madfiprotocol",
          }}
        />
        <Web3Provider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                backgroundColor: "#000",
                color: "white",
              },
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
          <div className="flex flex-col min-h-screen">
            <Header />
            <Component {...pageProps} />
            <Analytics />
            <Footer />
          </div>
        </Web3Provider>
      </ThemeProvider>
      { /* <ReactQueryDevtools /> */ }
    </QueryClientProvider>
  );
};

export default App;
