import "tailwindcss/tailwind.css";
import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";
import "@/styles/fonts.css";
import "@/styles/calendar-override.css";
import "react-loading-skeleton/dist/skeleton.css";
import { DefaultSeo } from "next-seo";
import Web3Provider from "@/components/Web3Provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster, ToastBar } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
// import { NEXT_PUBLIC_SITE_URL } from "@/lib/consts";
import SEO from "../../next-seo.config";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import CommonLayout from "@/components/Layouts/CommonLayout";

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

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => <CommonLayout>{page}</CommonLayout>);

  return (
    <QueryClientProvider client={queryClient}>
      <DefaultSeo {...SEO} />
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
  );
};

export default App;
