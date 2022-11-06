import { FC, Fragment, useEffect, useState, useCallback } from "react";
import { Menu, Popover, Transition } from "@headlessui/react";
import { mapValues } from "lodash/object";
import { last } from "lodash/array";
import { groupBy, sortBy } from "lodash/collection";
import { isEmpty } from "lodash/lang";
import { StreamrClient } from 'streamr-client'
import { STREAMR_PUBLIC_ID } from "@/lib/consts";
import { classNames } from "@/lib/utils/classNames";
import { joinGroup } from "@/lib/semaphore/semaphore";
import { Profile, useGetProfilesByHandles, useGetProfilesOwned } from "@/services/lens/getProfile";
import { getUrlForImageFromIpfs } from "@/utils/ipfs";
import { LensProfile, reactionsEntries } from "@/components/LensProfile";
import useIdentity from "@/hooks/useIdentity";
import useIsMounted from "@/hooks/useIsMounted";

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
  isLoadingEntry: boolean;
  setIsLoadingEntry: any;
  handle: boolean;
};

/**
 * This component takes club space data object and handles any live aspects with streamr
 * - connect to the streamr pub/sub client
 * - load the history for profiles that joined and left
 * - attempt to log an impression to privy store + join goody bag semaphore group
 * - party
 */
const LiveSpace: FC<Props> = ({
  clubSpaceObject,
  defaultProfile,
  address,
  isLoadingEntry,
  setIsLoadingEntry, handle
}) => {
  const isMounted = useIsMounted();
  const { identity } = useIdentity();

  const [isResending, setIsResending] = useState<boolean>(true)
  const [subscribed, setSubscribed] = useState<boolean>(false)
  const [liveProfiles, setLiveProfiles] = useState<string[]>();
  const [logs, setLogs] = useState([]);
  const [currentReaction, setCurrentReaction] = useState<{ type: string; handle: string; reactionUnicode: string }[]>();

  const { data: liveProfilesData } = useGetProfilesByHandles({}, liveProfiles); // TODO: not efficient but oh well

  useEffect(() => {
    const subscribe = async () => {
      const subscriptionParams = {
        stream: STREAMR_PUBLIC_ID,
        resend: { from: { timestamp: clubSpaceObject.createdAt } }
      };

      const sub = await window.streamrClient!.subscribe(subscriptionParams, (message, raw) => {
        if (isResending) {
          onResent(message, raw);
        } else {
          onMessage(message, raw);
        }
      });

      // BUG: object returned from #subscribe() should be of type `ResendSubscription` as `subscriptionParams`
      // contains the `resend prop`
      // @ts-expect-error: Property 'once' does not exist on type 'Subscription<T>'
      sub!.once('resendComplete', (): void => {
        setIsResending(false)

        onResendComplete();
      });
    };

    if (isMounted() && !subscribed) {
      if (typeof window !== "undefined" && !window.streamrClient) {
        const { address, privateKey } = StreamrClient.generateEthereumAccount();
        // window.streamrClient = useClient();
        // window.streamrClient = new StreamrClient({ auth: { ethereum: window.ethereum }});
        window.streamrClient = new StreamrClient({ auth: { privateKey } });
      }

      console.log(`mounted and subscribed to stream: ${STREAMR_PUBLIC_ID}`);
      console.log(`fetching historical from timestamp: ${clubSpaceObject.createdAt}`);

      subscribe();

      setSubscribed(true);
    }
  }, [isMounted, subscribed]);

  const onMessage = (content, metadata) => {
    if (content.clubSpaceId !== clubSpaceObject.clubSpaceId) return;

    // @TODO: handle reactions better?
    if (content.type === "REACTION") {
      setCurrentReaction((prev) => {
        const _prev = prev || [];
        const _current = _prev.find((r) => r.handle === content.handle);
        if (_current) {
          _current.reactionUnicode = content.reactionUnicode;
          return _prev;
        } else {
          return [
            ..._prev,
            { type: content.type, handle: content.handle, reactionUnicode: content.reactionUnicode },
          ];
        }
      });
      setTimeout(() => {
        setCurrentReaction(undefined);
      }, 2000);
    }

    if (content.handle === handle) return;

    console.log("MESSAGE RECEIVED");
    console.log(content);

    if (content.type === "JOIN") {
      setLiveProfiles((current) => {
        console.log('adding to the list...', [...current, content.handle]);
        return [...current, content.handle];
      });
    } else if (content.type === "LEAVE") {
      setLiveProfiles((current) => {
        const index = liveProfiles.indexOf((l) => l.handle === content.handle);
        console.log('removing from the list...', [
          ...current.slice(0, index),
          ...current.slice(index + 1)
        ]);
        return [
          ...current.slice(0, index),
          ...current.slice(index + 1)
        ];
      });
    }
  }

  const onResent = (content, metadata) => {
    // :shrug:
    if (content.clubSpaceId === clubSpaceObject.clubSpaceId && (content.type === "JOIN" || content.type === "LEAVE")) {
      setLogs((current) => { return [...logs, { ...content, timestamp: metadata.messageId.timestamp }] });
    }
  };

  const onResendComplete = () => {
    try {
      console.log("done fetching historical");
      const grouped = mapValues(groupBy(logs, "handle"), (_logs) => sortBy(_logs, _logs.timestamp));

      const stillHereYo = Object.keys(grouped)
        .map((_handle) => { if (last(grouped[_handle]).type !== "LEAVE") return _handle; })
        .filter((h) => h);

      console.log("liveProfiles");
      console.log(stillHereYo);

      // HACK
      if (!stillHereYo.includes(handle)) {
        stillHereYo.push(handle);
      }

      setLiveProfiles(stillHereYo);

      // publish a message to the stream
      console.log("publishing JOIN....");
      window.streamrClient!.publish(STREAMR_PUBLIC_ID, {
        type: "JOIN",
        clubSpaceId: clubSpaceObject.clubSpaceId,
        handle,
      });
    } catch (error) {
      console.log(error);
    }

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
  };

  const onSubscribed = () => {
    console.log("subscribed!");
  };

  const logPrivyImpression = async (payload) => {
    console.log("logging privy impression...");
    const { status } = await fetch(`/api/privy/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  // only connected lens profiles can react
  const sendMessage = (reactionUnicode: string) => {
    if (defaultProfile) {
      window.streamrClient!.publish(STREAMR_PUBLIC_ID, {
        type: "REACTION",
        clubSpaceId: clubSpaceObject.clubSpaceId,
        reactionUnicode,
        handle: defaultProfile?.handle,
      });
    }
  };

  useEffect(() => {
    if (!isMounted()) return;

    // on unmount
    return () => {
      // if (!streamrClient!.destroy.isStarted()) {
      //   // from streamr: Don’t publish in onbeforeunload i.e. you're trying to publish a message on the edge of document’s existance.
      //   console.log('publishing LEAVE...');
      //   streamrClient.publish(STREAMR_PUBLIC_ID, {
      //     type: "LEAVE",
      //     clubSpaceId: clubSpaceObject.clubSpaceId,
      //     handle
      //   });
      // }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoadingEntry) return null;

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
                <Menu.Button className="btn" disabled={!defaultProfile}>react</Menu.Button>
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
