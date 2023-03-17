import { LiveAudioPlayer } from "@/components/LiveAudioPlayer";
// import { ClubSpaceObject } from "@/components/LiveSpace";
import { NEXT_PUBLIC_SITE_URL } from "@/lib/consts";
import { ClubSpaceObjectWithTracks, getLiveClubspace } from "@/services/radio";
import { GetServerSideProps, NextPage } from "next";
import { NextSeo } from "next-seo";

import { IClubSpaceObject, getClubSpace } from "packages/clubspace-sdk/src";
// import { useRouter } from "next/router";
// import { getAudioPlayer, IClubSpaceObject, ITrack} from "packages/clubspace-sdk/src";

const EmbedSpace: NextPage = ({ clubSpaceObject }: { clubSpaceObject: ClubSpaceObjectWithTracks }) => {
  // const {
  //   query: { handle },
  // } = useRouter();

  return (
    <>
      <NextSeo
        title={`ClubSpace | ${clubSpaceObject.creatorLensHandle}`}
        description={`Join @${clubSpaceObject.creatorLensHandle} at their live listening party now!`}
        openGraph={{
          url: `${NEXT_PUBLIC_SITE_URL}/live/${clubSpaceObject.creatorLensHandle}`,
          title: `ClubSpace | ${clubSpaceObject.creatorLensHandle}`,
          description: `Join @${clubSpaceObject.creatorLensHandle} at their live listening party now!`,
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
      />
      <pre>
        <code>{JSON.stringify(clubSpaceObject, null, 2)}</code>
      </pre>
      {/* <LiveAudioPlayer
        streamURL={clubSpaceObject.streamURL}
        playlistTracks={clubSpaceObject.}

      /> */}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { handle },
  } = context;

  if (!handle || handle === "<no source>") return { notFound: true };

  try {
    const clubSpaceObject = await getLiveClubspace(handle as string);
    if (!clubSpaceObject) {
      console.log("SPACE NOT FOUND! MAY HAVE ENDED");
      return {
        notFound: true,
      };
    }

    console.log(`found space with id: ${clubSpaceObject.clubSpaceId}`);

    return { props: { clubSpaceObject } };
  } catch (error) {
    console.log(error);
  }

  // goes to 404 page
  return {
    notFound: true,
  };
};

export default EmbedSpace;
