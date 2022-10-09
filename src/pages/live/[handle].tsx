import { useSubscription, useClient } from "streamr-client-react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { groupBy } from "lodash/collection";
import { STREAMR_PUBLIC_ID } from "@/lib/consts";
import redisClient from "@/lib/utils/redisClient";
import { Profile, useGetProfilesOwned } from "@/services/lens/getProfile";

// @TODO: this component probably is not enough for the actual page, but a start
// - needs connected lens account
// - needs to route to 404 if the handle is not provided or clubSpaceId == undefined
const LiveSpace = ({ clubSpaceObject }) => {
  const {
    query: { handle },
    push,
  } = useRouter();
  const { isConnected, address } = useAccount();
  const client = useClient();
  const [hasMounted, setHasMounted] = useState(false);
  const [latestMessage, setLatestMessage] = useState();
  const [defaultProfile, setDefaultProfile] = useState<Profile>();
  const [liveProfiles, setLiveProfiles] = useState([]);
  const { data: profiles } = useGetProfilesOwned({}, address);
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (profiles?.length) {
      setDefaultProfile(profiles[0]);
    }
  }, [address, profiles]);

  if (!clubSpaceObject) {
    push("/404");
  }

  console.log(client);

  const handleEntry = async () => {
    const historical = await client.resend(
      STREAMR_PUBLIC_ID,
      { from: { timestamp: clubSpaceObject.createdAt } },
      (content) => {
        // :shrug:
        if (h.clubSpaceId === clubSpaceObject.clubSpaceId && (content.type === 'JOIN' || content.type === 'LEAVE')) {
          logs.push(content);
          setLogs(logs);
        }
      }
    );

    console.log(historical);

    historical.onFinally(() => {
      const grouped = groupBy(logs, 'lensHandle');
      // JOIN, LEAVE, JOIN
      const stillHereYo = Object.keys(grouped).map((handle) => grouped[handle].length % 2 !== 0);
      setLiveProfiles(stillHereYo);

      const hasJoined = logs.find((h) => h.lensHandle === defaultProfile.handle);
      console.log(`hasJoined: ${hasJoined}`);

      if (!hasJoined) {
        // publish a message to the stream
        const message = {
          type: 'JOIN',
          clubSpaceId: clubSpaceObject.clubSpaceId,
          lensHandle: defaultProfile?.handle,
        };
        client.publish(STREAMR_PUBLIC_ID, message);
        console.log('published JOIN')

        // log the impression for this clubspace
        const impressionPayload = {
          address,
          semGroupIdHex: clubSpaceObject.semGroupIdHex,
          impression: 'JOIN'
        };

        // fire + forget
        fetch(`/api/privy/write`, { method: 'POST', body: JSON.stringify(body) });

        setIsLoadingEntry(false); // TODO: lucas - render the stuff
      }
    });
  };

  // load stream history with this `clubSpaceId`
  // check if there is one with our lensHandle + type: joined
  // if not
  // - send JOINED event
  // - log privy impression with profileId/postId
  useEffect(() => {
    if (hasMounted) {
      handleEntry();

      window.onbeforeunload = () => {
        // publish a message to the stream
        const message = {
          type: 'LEAVE',
          clubSpaceId: clubSpaceObject.clubSpaceId,
          lensHandle: defaultProfile?.handle,
        };
        client.publish(STREAMR_PUBLIC_ID, message);
        console.log('published LEAVE')
        return 'Thanks for partying. Come back later to claim your swag';
      };
    }

    setHasMounted(true);
  }, []);

  const onMessage = (content, metadata) => {
    console.log(content);
    if (content.lensHandle === defaultProfile.lensHandle) return;

    if (content.type === 'JOIN') {
      liveProfiles.push(content.lensHandle);
      setLiveProfiles(liveProfiles);
    } else if (content.type === 'LEAVE') {
      const idx = liveProfiles.findIndex((l) => l === content.lensHandle);
      liveProfiles.splice(idx, 1);
      setLiveProfiles(liveProfiles);
    } else if (content.type === 'REACTION') {
      // TODO: lucas - set animation `content.reactionUnicode`
    }
  };

  const sendMessage = (reactionUnicode: string) => {
    const message = {
      type: 'REACTION',
      clubSpaceId: clubSpaceObject.clubSpaceId,
      reactionUnicode,
      lensHandle: defaultProfile?.handle,
    };
    client.publish(STREAMR_PUBLIC_ID, message);
  };

  useSubscription(
    {
      stream: STREAMR_PUBLIC_ID,
    },
    onMessage
  );

  if (isLoadingEntry) {
    return <>Entering the ClubSpace...</>
  }

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

    return { props: { clubSpaceObject } };
  } catch (error) {
    console.log(error);
  }

  return { props: {} };
};
