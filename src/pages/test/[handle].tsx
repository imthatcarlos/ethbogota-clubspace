import { LocalUserChoices } from "@livekit/components-react";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import "@livekit/components-styles";
import { useSignMessage } from "wagmi";
import useENS from "@/hooks/useENS";
import { Profile, useGetProfilesOwned } from "@/services/lens/getProfile";
import { LiveVideo } from "@/components/live/LiveVideo";
import { LiveDiscussion } from "@/components/live/LiveDiscussion";
import { ConnectWallet } from "@/components/ConnectWallet";
import { GetServerSideProps, NextPage } from "next";
import { getLiveClubspace } from "@/services/radio";
import { ClubSpaceObject, GateData } from "@/components/LiveSpace";
import { getAccessToken } from "@/hooks/useLensLogin";
import useMeetsGatedCondition from "@/hooks/useMeetsGatedCondition";
import { SpaceGated } from "@/components/SpaceGated";
import { TIER_OPEN } from "@/lib/consts";
import { generateName } from "@/lib/utils/nameGenerator";

const LivePageAtHandle: NextPage = () => {
  // const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(undefined);

  const params = typeof window !== "undefined" ? new URLSearchParams(location.search) : null;
  // video | discussion | playlist
  const spaceType = params?.get("spaceType") ?? "video";
  // const spaceType = clubSpaceObject.spaceType

  const {
    query: { handle },
    push,
  } = useRouter();

  const { isConnected, address } = useAccount();
  const { data: profilesResponse, isLoading: isLoadingProfiles } = useGetProfilesOwned({}, address);
  // const {
  //   data: meetsGatedCondition,
  //   isLoading: isLoadingMeetsGated,
  //   refetch: refetchMeetsGatedCondition,
  // } = useMeetsGatedCondition(address, getAccessToken(), clubSpaceObject);
  // const { data: ensData, isLoading: isLoadingENS } = useENS(address);
  const [defaultProfile, setDefaultProfile] = useState<Profile>();
  const [loadingDefaultProfile, setLoadingDefaultProfile] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [_canEnter, setCanEnter] = useState();

  const {
    data: signResult,
    error: signError,
    signMessage,
  } = useSignMessage({
    onSuccess: () => {
      setIsHost(true);
    },
  });

  // @TODO: remove this once space creation has been tested
  // const roomName = useMemo(
  //   () => clubSpaceObject.clubSpaceId ?? "c3577427-f8b9-44e3-bb4f-2c8dce0f1462",
  //   [clubSpaceObject.clubSpaceId]
  // );
  const roomName = "c3577427-f8b9-44e3-bb4f-2c8dce0f1462";
  const userIdentity = useMemo(() => address ?? generateName(), [address]);

  useEffect(() => {
    if (!isLoadingProfiles) {
      // @ts-ignore
      setDefaultProfile(profilesResponse ? profilesResponse?.defaultProfile : null);
      setLoadingDefaultProfile(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isLoadingProfiles]);

  // const preJoinSubmit = (values: LocalUserChoices) => {
  //   console.log("Joining with: ", values);
  //   // check for host
  //   // if(defaultProfile?.id === clubSpaceObject.creatorLensProfileId)
  //   if (defaultProfile && defaultProfile?.handle === handle) {
  //     const message = `I am the host ${handle}`;
  //     signMessage({ message });
  //     if (signError) {
  //       alert("failed to verify host");
  //     } else {
  //       // set host or smth in metadata
  //       setIsHost(true);
  //     }
  //   }

  //   setPreJoinChoices(values);
  // };

  // useEffect(() => {
  //   if (!isLoadingMeetsGated) {
  //     setCanEnter(meetsGatedCondition);
  //   }
  // }, [isLoadingMeetsGated, meetsGatedCondition]);

  // const canEnter = useMemo(() => {
  //   // check for host first
  //   if (clubSpaceObject?.creatorLensProfileId === defaultProfile?.id) {
  //     setIsHost(true);
  //     return true; // is host
  //   }
  //   // @FIXME: gated is only an object or undefined, so this validation with TIER_OPEN
  //   // doesn't make sense
  //   // @see {@link CreateSpace} at 323
  //   if (!clubSpaceObject?.gated || clubSpaceObject?.gated === TIER_OPEN) return true; // not gated

  //   return _canEnter !== false;
  // }, [defaultProfile, clubSpaceObject, _canEnter]);

  if (!isConnected) {
    return (
      <div>
        <ConnectWallet />
      </div>
    );
  }

  // @TODO: remove if we don't need to confirm host with signing
  if (isConnected && !isLoadingProfiles && defaultProfile && defaultProfile?.handle === handle && !signResult) {
    const message = `I am the host ${handle}`;
    return (
      <div className="flex items-center min-h-[80dvh] flex-col justify-center">
        <div className="max-w-fit">
          I see you're the host, please sign this message.
          <button className="btn" onClick={() => signMessage({ message })}>
            I'm the host
          </button>
        </div>
      </div>
    );
  }

  // if (status !== "connected" && (isLoadingProfiles || isLoadingENS)) {
  //   return <>loading...</>;
  // }

  // if (status === "connected" && userIdentity === "user-identity") {
  //   return <>loading...</>;
  // }

  // if (clubSpaceObject.gated && (!getAccessToken() || canEnter === false)) {
  //   return (
  //     <SpaceGated
  //       handle={clubSpaceObject.handle}
  //       gated={clubSpaceObject.gated as GateData}
  //       creatorLensProfileId={clubSpaceObject.creatorLensProfileId}
  //       lensPubId={clubSpaceObject.lensPubId}
  //       refetchMeetsGatedCondition={refetchMeetsGatedCondition}
  //     />
  //   );
  // }

  if (spaceType === "video") {
    return (
      <LiveVideo
        // preJoinSubmit={preJoinSubmit}
        roomName={roomName}
        // preJoinChoices={preJoinChoices}
        userIdentity={userIdentity}
        isHost={isHost}
      />
    );
  }

  if (spaceType === "discussion") {
    return (
      <LiveDiscussion
        // preJoinSubmit={preJoinSubmit}
        roomName={roomName}
        // preJoinChoices={preJoinChoices}
        userIdentity={userIdentity}
        isHost={isHost}
      />
    );
  }

  // @TODO: create component from old [handle] page and pass props from here
  return <>{spaceType === "playlist" && <>go to old infra</>}</>;
};

export default LivePageAtHandle;

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const {
//     query: { handle },
//   } = context;

//   // should never happen
//   if (!handle || handle === "<no source>")
//     return {
//       notFound: true,
//     };

//   try {
//     const clubSpaceObject = await getLiveClubspace(handle as string);
//     if (!clubSpaceObject) {
//       console.log("SPACE NOT FOUND! MAY HAVE EXPIRED FROM REDIS");
//       return {
//         // we need to have the handle in the _app when there's no space
//         // to provide the correct iframely link
//         props: { handle },
//       };
//     }

//     console.log(`found space with id: ${clubSpaceObject.clubSpaceId}`);
//     console.log(clubSpaceObject);

//     return { props: { clubSpaceObject } };
//   } catch (error) {
//     console.log(error);
//   }

//   return {
//     notFound: true,
//   };
// };
