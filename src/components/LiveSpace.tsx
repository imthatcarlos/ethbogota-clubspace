import { FC, Fragment, useEffect, useState } from "react";
import { Menu, Popover, Transition } from "@headlessui/react";
import { useSubscription, useClient } from 'streamr-client-react'
import { mapValues } from "lodash/object";
import { last } from "lodash/array";
import { groupBy, sortBy } from "lodash/collection";
import { isEmpty } from "lodash/lang";
import { STREAMR_PUBLIC_ID } from "@/lib/consts";
import { classNames } from "@/lib/utils/classNames";
import { joinGroup } from "@/lib/semaphore/semaphore";
import { Profile, useGetProfilesByHandles, useGetProfilesOwned } from "@/services/lens/getProfile";
import { getUrlForImageFromIpfs } from "@/utils/ipfs";
import { LensProfile, reactionsEntries } from "@/components/LensProfile";
import { useIdentity } from "@/hooks/identity";

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

type LensProfileObject = {
  id: string;
  name: string;
  bio: string;
  picture: any;
  handle: string;
  coverPicture: any;
  ownedBy: string;
  stats: any;
};

type Props = {
  clubSpaceObject: ClubSpaceObject;
  defaultProfile: LensProfileObject;
  address: string;
  setIsLoadingEntry: any;
};

/**
 * This component takes club space data object and handles any live aspects with streamr
 * - connect to the streamr pub/sub client
 * - load the history for profiles that joined and left
 * - attempt to log an impression to privy store + join goody bag semaphore group
 * - party
 */
const LiveSpace: FC<Props> = ({ clubSpaceObject, defaultProfile, address, setIsLoadingEntry }) => {
  const streamrClient = useClient();
  const { identity } = useIdentity();
  const [liveProfiles, setLiveProfiles] = useState<string[]>();
  const [logs, setLogs] = useState([]);
  const [currentReaction, setCurrentReaction] = useState<{ type: string; handle: string; reactionUnicode: string }[]>();
  const { data: liveProfilesData } = useGetProfilesByHandles({}, liveProfiles); // TODO: not efficient but oh well

  const logPrivyImpression = async (payload) => {
    console.log("logging privy impression...");
    const { status } = await fetch(`/api/privy/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  useSubscription({
    stream: STREAMR_PUBLIC_ID,
  }, (content, metadata) => {
    if (content.clubSpaceId !== clubSpaceObject.clubSpaceId) return;

    // @TODO: handle reactions better?
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
  });

  // load stream history with this `clubSpaceId`
  // check if there is one with our lensHandle + type: joined
  // if not
  // - send JOINED event
  // - log privy impression with profileId/postId
  useEffect(() => {
    if (defaultProfile && streamrClient) {
      handleEntry();

      window.onbeforeunload = () => {
        streamrClient.publish(STREAMR_PUBLIC_ID, {
          type: "LEAVE",
          clubSpaceId: clubSpaceObject.clubSpaceId,
          lensHandle: defaultProfile.handle,
        });
      };

      return () => {
        streamrClient.unsubscribe(STREAMR_PUBLIC_ID);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultProfile, streamrClient]);

  const handleEntry = async () => {
    // @TODO: parse historical messages more efficiently
    const historical = await streamrClient.resend(
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

      const stillHereYo = Object.keys(grouped)
        .map((handle) => { if (last(grouped[handle]).type !== "LEAVE") return handle; })
        .filter((h) => h);

      // HACK
      console.log(grouped[defaultProfile.handle]);
      if (!stillHereYo.includes(defaultProfile.handle)) {
        stillHereYo.push(defaultProfile.handle);
      }

      console.log("liveProfiles");
      console.log(stillHereYo);

      setLiveProfiles(stillHereYo);

      const hasJoined = logs.find((h) => h.lensHandle === defaultProfile.handle);
      console.log(`hasJoined`, hasJoined);

      // // @TODO: client is being destroyed...
      // console.log('being destroyed?', streamrClient.destroy.isStarted());
      // // publish a message to the stream
      // console.log("publishing JOIN....");
      // streamrClient.publish(STREAMR_PUBLIC_ID, {
      //   type: "JOIN",
      //   clubSpaceId: clubSpaceObject.clubSpaceId,
      //   lensHandle: defaultProfile.handle,
      // });

      // if (isEmpty(hasJoined)) {
      //   // log the impression for this clubspace
      //   logPrivyImpression({
      //     address,
      //     semGroupIdHex: clubSpaceObject.semGroupIdHex,
      //     impression: "JOIN",
      //   });
      //   // join semaphore group
      //   joinGroup(defaultProfile.handle, identity, clubSpaceObject.semGroupIdHex);
      // }

      setIsLoadingEntry(false);
    });
  };

  const sendMessage = (reactionUnicode: string) => {
    streamrClient.publish(STREAMR_PUBLIC_ID, {
      type: "REACTION",
      clubSpaceId: clubSpaceObject.clubSpaceId,
      reactionUnicode,
      lensHandle: defaultProfile?.handle,
    });
  };

  return (
    <>
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
              <div className="w-36 flex gap-4 mt-4">
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
