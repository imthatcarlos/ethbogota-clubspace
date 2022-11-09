import { FC, Fragment, useEffect, useState, useCallback } from "react";
import { Menu, Popover, Transition } from "@headlessui/react";
import { useJam } from 'jam-core-react';
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
  setIsLoadingEntry,
  handle,
}) => {
  const { identity } = useIdentity();
  const isMounted = useIsMounted();
  const [state, { enterRoom, leaveRoom, setProps }] = useJam();

  console.log(state);

  const [isResending, setIsResending] = useState<boolean>(true)
  const [subscribed, setSubscribed] = useState<boolean>(false)
  const [liveProfiles, setLiveProfiles] = useState<string[]>();
  const [logs, setLogs] = useState([]);
  const [currentReaction, setCurrentReaction] = useState<{ type: string; handle: string; reactionUnicode: string }[]>();

  const { data: liveProfilesData } = useGetProfilesByHandles({}, liveProfiles); // TODO: not efficient but oh well

  useEffect(() => {
    const join = async (roomId) => {
      await setProps('roomId', roomId);
      console.log(`! entering room: ${roomId}`);
      await enterRoom(roomId);
    }

    if (isMounted) {
      join(clubSpaceObject.clubSpaceId);

      // TODO: we should post the fact that we left on component unmount
      // return () => {
      //   console.log(`LEAVING`);
      //   leaveRoom(clubSpaceObject.clubSpaceId)
      // }
    }
  }, [isMounted]);

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
