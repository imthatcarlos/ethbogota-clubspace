import { useSubscription, useClient } from "streamr-client-react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { useState } from "react";
import { STREAMR_PUBLIC_ID } from "@/lib/consts";
import redisClient from "@/lib/utils/redisClient";

// @TODO: this component probably is not enough for the actual page, but a start
// - needs connected lens account
// - needs to route to 404 if the handle is not provided or clubSpaceId == undefined
const LiveSpace = ({ clubSpaceId }) => {
  const {
    query: { handle },
    push,
  } = useRouter();
  const client = useClient();
  const [latestMessage, setLatestMessage] = useState();

  if (!clubSpaceId) {
    push("/404");
  }

  const onMessage = (content, metadata) => {
    console.log(content);
  };

  const sendMessage = (reactionUnicode: string) => {
    const message = {
      clubSpaceId,
      reactionUnicode,
      lensHandle: "carlosbeltran.lens", // @TODO: get from connected account?
    };
    client.publish(STREAMR_PUBLIC_ID, message);
  };

  useSubscription(
    {
      stream: STREAMR_PUBLIC_ID,
    },
    onMessage
  );

  return (
    <>
      <p>Latest message: {latestMessage}</p>
      <button
        className="flex w-36 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={() => sendMessage("👏")}
      >
        Send 👏
      </button>
    </>
  );
};

export default LiveSpace;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { handle },
  } = context;

  try {
    const data = await redisClient.get(handle);
    if (!data) return { props: {} };

    const clubSpaceObject = JSON.parse(data);
    console.log(clubSpaceObject);

    return { props: { clubSpaceId: clubSpaceObject.clubSpaceId } };
  } catch (error) {
    console.log(error);
  }

  return { props: {} };
};
