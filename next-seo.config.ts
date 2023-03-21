import { NEXT_PUBLIC_SITE_URL } from "@/lib/consts";
import { DefaultSeoProps } from "next-seo";

const SEO: DefaultSeoProps = {
  titleTemplate: "ClubSpace | %s",
  defaultTitle: "ClubSpace",
  description: "Promote your music NFTs with a live listening party",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: NEXT_PUBLIC_SITE_URL,
    site_name: "ClubSpace",
    images: [
      {
        url: "https://link.storjshare.io/raw/jwg3vujynjlvbn5gdgm5yjoob7mq/misc%2Fclubspace.png",
        width: 1200,
        height: 630,
        alt: "clubspace.png",
      },
    ],
  },
  twitter: {
    handle: "@madfiprotocol",
  },
};

export default SEO;
