// import { useSubscription, useClient } from "streamr-client-react";
import { LensProfile, reactionsEntries } from "@/components/LensProfile";
import { STREAMR_PUBLIC_ID } from "@/lib/consts";
import { classNames } from "@/lib/utils/classNames";
import redisClient from "@/lib/utils/redisClient";
import { Profile, useGetProfilesByHandles, useGetProfilesOwned } from "@/services/lens/getProfile";
import { getUrlForImageFromIpfs } from "@/utils/ipfs";
import { Menu, Popover, Transition } from "@headlessui/react";
import { fetchPlaylistById } from "@spinamp/spinamp-sdk";
import { last } from "lodash/array";
import { groupBy, sortBy } from "lodash/collection";
import { isEmpty } from "lodash/lang";
import { mapValues } from "lodash/object";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { FC, Fragment, useEffect, useMemo, useRef, useState } from "react";
import StreamrClient from "streamr-client";
import { useAccount, useQuery } from "wagmi";
import axios from "axios";
import { joinGroup } from "@/lib/semaphore/semaphore";
import { useIdentity } from "@/hooks/identity";
import { SpectrumVisualizer, SpectrumVisualizerTheme } from "react-audio-visualizers";

type ClubSpaceObject = {
  clubSpaceId: string;
  createdAt: number;
  creatorAddress: string;
  creatorLensHandle: string;
  creatorLensProfileId: string;
  decentContractAddress: string;
  endAt: number;
  lensPubId: string;
  semGroupIdHex: string;
  spinampPlaylistId: string;
};

type Props = {
  clubSpaceObject: ClubSpaceObject;
};

const LiveSpace: FC<Props> = ({ clubSpaceObject }) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [latestMessage, setLatestMessage] = useState();
  const { identity } = useIdentity();
  const { push } = useRouter();
  const { address } = useAccount();
  const [defaultProfile, setDefaultProfile] = useState<Profile>();
  const [liveProfiles, setLiveProfiles] = useState<string[]>();
  const { data: profiles } = useGetProfilesOwned({}, address);
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const [logs, setLogs] = useState([]);
  const [currentReaction, setCurrentReaction] = useState<{ type: string; handle: string; reactionUnicode: string }[]>();
  const { data: liveProfilesData } = useGetProfilesByHandles({}, liveProfiles); // TODO: not efficient but oh well
  let hasSongEnded = useRef(false);

  const { data: playlists } = useQuery(
    ["playlist", clubSpaceObject],
    () => fetchPlaylistById(clubSpaceObject.spinampPlaylistId),
    {
      enabled: !!clubSpaceObject,
    }
  );

  const { data: durations } = useQuery(["playlist-durations", clubSpaceObject.spinampPlaylistId], () =>
    Promise.all(
      playlists.playlistTracks.map(async (track) => {
        const context = new AudioContext();

        const res = await fetch(track.lossyAudioUrl);

        // get duration from audio from response
        const audioBuffer = await res.arrayBuffer();
        const audioBufferSourceNode = context.createBufferSource();
        audioBufferSourceNode.buffer = await context.decodeAudioData(audioBuffer);
        const duration = audioBufferSourceNode.buffer.duration;

        return duration;
      }, 0)
    )
  );

  const wholePlaylistDuration = durations?.reduce((prev, curr) => prev + curr, 0);

  let currentTrackIndex = Math.floor((Date.now() - clubSpaceObject.createdAt) / wholePlaylistDuration);
  // normalize currentTrackIndex to be within playlistTracks length
  const currentTrack = useMemo(
    () => playlists?.playlistTracks[currentTrackIndex % playlists.playlistTracks.length],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentTrackIndex, playlists, hasSongEnded]
  );

  // console.log(liveProfilesData);

  if (typeof window !== "undefined" && !window.client) {
    const { address, privateKey } = StreamrClient.generateEthereumAccount();
    window.client = new StreamrClient({ auth: { privateKey } });
  }

  useEffect(() => {
    if (profiles?.length) {
      setDefaultProfile(profiles[0]);
    }
  }, [address, profiles]);

  const logPrivy = async (impressionPayload) => {
    console.log("logging privy impression...");
    const { status } = await fetch(`/api/privy/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(impressionPayload),
    });
  };

  const handleEntry = async () => {
    // HACK: until their client accepts provider from rainbowkit :shrug:
    // const client = new StreamrClient(provider);

    const subscription = await window.client.subscribe(STREAMR_PUBLIC_ID, onMessage);

    const historical = await window.client.resend(
      STREAMR_PUBLIC_ID,
      { from: { timestamp: clubSpaceObject.createdAt } },
      (content, metadata) => {
        // :shrug:
        if (
          content.clubSpaceId === clubSpaceObject.clubSpaceId &&
          (content.type === "JOIN" || content.type === "LEAVE")
        ) {
          logs.push({ ...content, timestamp: metadata.messageId.timestamp });
          setLogs(logs);
        }
      }
    );

    console.log(`fetching historical from timestamp: ${clubSpaceObject.createdAt}`);

    historical.onFinally(() => {
      console.log("done fetching historical");
      const grouped = mapValues(groupBy(logs, "lensHandle"), (_logs) => sortBy(_logs, _logs.timestamp));
      // JOIN, LEAVE, JOIN
      // console.log(grouped);
      const stillHereYo = Object.keys(grouped)
        .map((handle) => {
          if (last(grouped[handle]).type !== "LEAVE") return handle;
        })
        .filter((h) => h);

      // HACK
      console.log(grouped[defaultProfile.handle])
      if (!stillHereYo.includes(defaultProfile.handle)) {
        stillHereYo.push(defaultProfile.handle)
      }

      console.log("liveProfiles");
      console.log(stillHereYo);

      setLiveProfiles(stillHereYo);

      // console.log(logs)
      const hasJoined = logs.find((h) => h.lensHandle === defaultProfile.handle);
      console.log(`hasJoined`, hasJoined);

      // publish a message to the stream
      const message = {
        type: "JOIN",
        clubSpaceId: clubSpaceObject.clubSpaceId,
        lensHandle: defaultProfile.handle,
      };
      console.log("publishing JOIN....");
      window.client.publish(STREAMR_PUBLIC_ID, message);

      if (isEmpty(hasJoined)) {
        // log the impression for this clubspace
        logPrivy({
          address,
          semGroupIdHex: clubSpaceObject.semGroupIdHex,
          impression: "JOIN",
        });
        // join semaphore group
        joinGroup(defaultProfile.handle, identity);
      }

      setIsLoadingEntry(false); // TODO: lucas - render the stuff
    });
  };

  // load stream history with this `clubSpaceId`
  // check if there is one with our lensHandle + type: joined
  // if not
  // - send JOINED event
  // - log privy impression with profileId/postId
  useEffect(() => {
    if (defaultProfile) {
      handleEntry();

      window.onbeforeunload = () => {
        const message = {
          type: "LEAVE",
          clubSpaceId: clubSpaceObject.clubSpaceId,
          lensHandle: defaultProfile.handle,
        };
        console.log("publishing LEAVE....");
        window.client.publish(STREAMR_PUBLIC_ID, message);
      };
      return () => {
        window.client.unsubscribe(STREAMR_PUBLIC_ID);
        // publish a message to the stream
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultProfile]);

  const onMessage = (content, metadata) => {
    if (content.clubSpaceId !== clubSpaceObject.clubSpaceId) return;

    if (content.type === "REACTION") {
      setCurrentReaction((prev) => {
        const _prev = prev || [];
        const _current = _prev.find((r) => r.handle === content.lensHandle);
        if (_current) {
          _current.reactionUnicode = content.reactionUnicode;
          return _prev;
        } else {
          return [
            ..._prev,
            { type: content.type, handle: content.lensHandle, reactionUnicode: content.reactionUnicode },
          ];
        }
      });
      setTimeout(() => {
        setCurrentReaction(undefined);
      }, 2000);
    }

    if (content.lensHandle === defaultProfile.handle) return;
    console.log("MESSAGE RECEIVED");
    console.log(content);
    if (content.type === "JOIN") {
      const copy = [...liveProfiles];
      copy.push(content.lensHandle);
      setLiveProfiles(copy);
    } else if (content.type === "LEAVE") {
      const idx = liveProfiles.findIndex((l) => l === content.lensHandle);
      const copy = [...liveProfiles];
      copy.splice(idx, 1);
      setLiveProfiles(copy);
    }
  };

  const sendMessage = (reactionUnicode: string) => {
    const message = {
      type: "REACTION",
      clubSpaceId: clubSpaceObject.clubSpaceId,
      reactionUnicode,
      lensHandle: defaultProfile?.handle,
    };
    console.log("publishing REACTION....", message);
    window.client.publish(STREAMR_PUBLIC_ID, message);
  };

  if (!clubSpaceObject) {
    push("/404");
    return;
  }
  if (isLoadingEntry) {
    return <>Entering the ClubSpace...</>;
  }

  return (
    <>
      <div className="w-full relative h-[60vh]">
        <SpectrumVisualizer
          audio={currentTrack?.lossyAudioUrl}
          theme={SpectrumVisualizerTheme.squaredBars}
          colors={["#4f46e5", "#6366f1"]}
          iconsColor="#4f46e5"
          backgroundColor="#000"
          showMainActionIcon={false}
          showLoaderIcon
          highFrequency={8000}
        />
      </div>
      {/* <header className="w-full h-[60vh] relative"></header> */}
      <div className="w-full border border-grey-700 shadow-xl flex flex-wrap gap-6 p-8 rounded-sm relative">
        {liveProfilesData &&
          liveProfilesData?.map((profile) => {
            return (
              <LensProfile
                key={profile.handle}
                handle={profile.handle}
                picture={getUrlForImageFromIpfs(profile.picture.original.url)}
                reaction={currentReaction?.find((r) => r.handle === profile.handle)}
              />
            );
          })}
      </div>
      <Popover
        className={({ open }) =>
          classNames(
            open ? "fixed inset-0 z-40 overflow-y-auto" : "",
            "shadow-sm lg:static bottom-0 lg:overflow-y-visible"
          )
        }
      >
        {({ open }) => (
          <>
            <Menu as="div" className="relative flex-shrink-0">
              <div className="w-36">
                <Menu.Button className="btn">react</Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none flex gap-4 flex-wrap">
                  {reactionsEntries.map(([key, value]) => (
                    <Menu.Item key={value}>
                      {({ active }) => <button onClick={() => sendMessage(value)}>{value}</button>}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>

            <Popover.Panel className="" aria-label="Global"></Popover.Panel>
          </>
        )}
      </Popover>
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
