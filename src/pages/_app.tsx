import "tailwindcss/tailwind.css";
import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";
import "@/styles/fonts.css";
import "@/styles/calendar-override.css";
import "react-loading-skeleton/dist/skeleton.css";
import Web3Provider from "@/components/Web3Provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster, ToastBar } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import CommonLayout from "@/components/Layouts/CommonLayout";
import Head from "next/head";
import { NEXT_PUBLIC_SITE_URL } from "@/lib/consts";
import { LivepeerConfig, createReactClient, studioProvider } from "@livepeer/react";
import { env } from "@/env.mjs";

const client = createReactClient({
  provider: studioProvider({ apiKey: env.NEXT_PUBLIC_LIVEPEER_API_KEY }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24,
    },
  },
});

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// pageProps flow in Next goes like this:
// getServerSideProps | other next function in route -> _app -> Route Component
// Fix for SEO, see: https://github.com/vercel/next.js/issues/35172
const HandleSEO = ({ pageProps }) => {
  const { handle, clubSpaceObject } = pageProps;

  if (clubSpaceObject) {
    return (
      <Head>
        <title>ClubSpace | @{clubSpaceObject?.creatorLensHandle}</title>
        <meta
          name="description"
          content={`@${clubSpaceObject?.creatorLensHandle} is hosting a live listening party!`}
        ></meta>
        <meta property="og:title" content={`ClubSpace | ${clubSpaceObject?.creatorLensHandle}`}></meta>
        <meta
          property="og:description"
          content={`@${clubSpaceObject?.creatorLensHandle} is hosting a live listening party!`}
        ></meta>
        <meta property="og:url" content={`${NEXT_PUBLIC_SITE_URL}/live/${clubSpaceObject?.creatorLensHandle}`}></meta>
        <meta property="og:type" content="website"></meta>
        <meta
          property="og:image"
          content="https://link.storjshare.io/raw/jwg3vujynjlvbn5gdgm5yjoob7mq/misc%2Fclubspace.png"
        ></meta>
        <meta property="og:image:alt" content="clubspace.png"></meta>
        <meta property="og:image:width" content="1200"></meta>
        <meta property="og:image:height" content="630"></meta>
        <meta property="og:locale" content="en_IE"></meta>
        <meta property="og:site_name" content="ClubSpace"></meta>
        <meta name="twitter:creator" content="@madfiprotocol"></meta>
        <meta name="twitter:card" content="summary_large_image"></meta>
        <meta name="twitter:title" content={`ClubSpace | @${clubSpaceObject?.creatorLensHandle}`}></meta>
        <meta
          name="twitter:description"
          content={`@${clubSpaceObject?.creatorLensHandle} is hosting a live listening party!`}
        ></meta>
        <meta
          name="twitter:image"
          content="https://link.storjshare.io/raw/jwg3vujynjlvbn5gdgm5yjoob7mq/misc%2Fclubspace.png"
        ></meta>
        <link
          rel="iframely player audio"
          type="text/html"
          href={`${NEXT_PUBLIC_SITE_URL}/embed/${clubSpaceObject?.creatorLensHandle}`}
          media="(aspect-ratio: 2/1)"
        ></link>
      </Head>
    );
  }

  return (
    <Head>
      <title>ClubSpace</title>
      <meta name="description" content="Promote your NFT drops with a live listening party"></meta>
      <meta property="og:title" content="ClubSpace"></meta>
      <meta property="og:description" content="Promote your NFT drops with a live listening party"></meta>
      <meta property="og:url" content={NEXT_PUBLIC_SITE_URL}></meta>
      <meta property="og:type" content="website"></meta>
      <meta
        property="og:image"
        content="https://link.storjshare.io/raw/jwg3vujynjlvbn5gdgm5yjoob7mq/misc%2Fclubspace.png"
      ></meta>
      <meta property="og:image:alt" content="clubspace.png"></meta>
      <meta property="og:image:width" content="1200"></meta>
      <meta property="og:image:height" content="630"></meta>
      <meta property="og:locale" content="en_IE"></meta>
      <meta property="og:site_name" content="ClubSpace"></meta>
      <meta name="twitter:creator" content="@madfiprotocol"></meta>
      <meta name="twitter:card" content="summary_large_image"></meta>
      <meta name="twitter:title" content="ClubSpace"></meta>
      <meta name="twitter:description" content="Promote your NFT drops with a live listening party"></meta>
      <meta
        name="twitter:image"
        content="https://link.storjshare.io/raw/jwg3vujynjlvbn5gdgm5yjoob7mq/misc%2Fclubspace.png"
      ></meta>
      {handle && (
        <link
          rel="iframely player audio"
          type="text/html"
          href={`${NEXT_PUBLIC_SITE_URL}/embed/${handle}`}
          media="(aspect-ratio: 2/1)"
        ></link>
      )}
    </Head>
  );
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => <CommonLayout>{page}</CommonLayout>);
  return (
    <>
      <HandleSEO pageProps={pageProps} />
      <LivepeerConfig client={client}>
        <QueryClientProvider client={queryClient}>
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
            {getLayout(
              <>
                <Component {...pageProps} />
                <Analytics />
              </>
            )}
          </Web3Provider>
          {/* <ReactQueryDevtools /> */}
        </QueryClientProvider>
      </LivepeerConfig>
    </>
  );
};

export default App;
