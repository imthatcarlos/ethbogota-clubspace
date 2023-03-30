import { Player } from "@livepeer/react";
import { GetServerSideProps, NextPage } from "next";
import { getLiveClubspace } from "@/services/radio";
import { ClubSpaceObject } from "@/components/LiveSpace";
import LiveSpacePage from "@/components/LiveSpacePage";

const LivePageAtHandle: NextPage = ({
  clubSpaceObject,
  playbackId,
}: {
  clubSpaceObject: ClubSpaceObject | undefined;
  playbackId: string | undefined;
}) => {
  // check if it's livepeer
  // render playerComponent if it is, otherwise, render the space
  if (!clubSpaceObject && false) {
    return (
      <Player
        title="some title"
        playbackId={playbackId}
        showPipButton
        showTitle={false}
        aspectRatio="16to9"
        poster={<></>}
        controls={{
          autohide: 3000,
        }}
        theme={{
          radii: { containerBorderRadius: "10px" },
        }}
      />
    );
  }
  return <LiveSpacePage clubSpaceObject={clubSpaceObject} />;
};

export default LivePageAtHandle;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { handle },
  } = context;

  // should never happen
  if (!handle || handle === "<no source>")
    return {
      notFound: true,
    };

  try {
    // @TODO: get from db if space will use livepeer and get playbackId
    const clubSpaceObject = await getLiveClubspace(handle as string);
    if (!clubSpaceObject) {
      console.log("SPACE NOT FOUND! MAY HAVE EXPIRED FROM REDIS");
      return {
        // we need to have the handle in the _app when there's no space
        // to provide the correct iframely link
        props: { handle },
      };
    }

    console.log(`found space with id: ${clubSpaceObject.clubSpaceId}`);
    // console.log(clubSpaceObject);

    return { props: { clubSpaceObject } };
  } catch (error) {
    console.log(error);
  }

  return {
    notFound: true,
  };
};
