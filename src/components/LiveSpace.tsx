import { FC, Fragment, useEffect, useState, useCallback } from "react";
import { Menu, Popover, Transition } from "@headlessui/react";
import { useJam } from 'jam-core-react';
import { isEmpty } from 'lodash/lang';
import { classNames } from "@/lib/utils/classNames";
import { joinGroup } from "@/lib/semaphore/semaphore";
import { Profile, useGetProfilesByHandles, useGetProfilesOwned } from "@/services/lens/getProfile";
import { getUrlForImageFromIpfs } from "@/utils/ipfs";
import { LensProfile, reactionsEntries } from "@/components/LensProfile";
import useIdentity from "@/hooks/useIdentity";
import useIsMounted from "@/hooks/useIsMounted";
import useUnload from "@/hooks/useUnload";

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
  setIsLoadingEntry,
  handle,
}) => {
  const { identity } = useIdentity();
  const isMounted = useIsMounted();
  const [{ identities, myIdentity, reactions }, { enterRoom, leaveRoom, setProps, updateInfo, sendReaction }] = useJam();
  const [currentReaction, setCurrentReaction] = useState<{ type: string; handle: string; reactionUnicode: string }[]>();
  const [connectedPeers, setConnectedPeers] = useState<string[]>();

  useEffect(() => {
    const join = async () => {
      await setProps('roomId', clubSpaceObject.clubSpaceId);
      await updateInfo({
        handle,
        profile: {
          avatar: defaultProfile?.picture?.original?.url,
          name: defaultProfile?.name,
          totalFollowers: defaultProfile?.stats?.totalFollowers
        }
      });
      console.log(`JOINING: ${clubSpaceObject.clubSpaceId}`);
      await enterRoom(clubSpaceObject.clubSpaceId);

      // USER IS IN
      setIsLoadingEntry(false);
    };

    if (isMounted && isLoadingEntry) {
      join();
    }
  }, [isMounted]);

  useUnload(async () => {
    console.log(`LEAVING`);
    await leaveRoom(clubSpaceObject.clubSpaceId);
  });

  // @TODO: run if prev != new
  useEffect(() => {
    console.log(identities);
    setConnectedPeers(Object.keys(identities));
  }, [identities]);

  // @TODO: run if prev != new
  useEffect(() => {
    console.log(reactions);
  }, [reactions]);

  if (isLoadingEntry) return null;

  return (
    <>
      <div className="w-full border border-grey-700 shadow-xl flex flex-wrap gap-6 p-8 rounded-sm relative">
        {connectedPeers &&
          connectedPeers?.map((peerId) => {
            return (
              <LensProfile
                key={identities[peerId].handle}
                handle={identities[peerId].handle}
                picture={
                  identities[peerId].profile
                    ? getUrlForImageFromIpfs(identities[peerId].profile.avatar)
                    : ""}
                name={identities[peerId].profile?.name}
                totalFollowers={identities[peerId].profile?.totalFollowers}
                reaction={isEmpty(reactions[peerId]) ? null : reactions[peerId][0]}
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
                      {({ active }) => <button onClick={async () => await sendReaction(value)}>{value}</button>}
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
