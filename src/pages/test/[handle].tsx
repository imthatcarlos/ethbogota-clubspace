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

export default function CustomRoomConnection() {
  const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(undefined);

  const params = typeof window !== "undefined" ? new URLSearchParams(location.search) : null;
  // video | discussion | playlist
  const spaceType = params?.get("spaceType") ?? "video";

  const {
    query: { handle },
    push,
  } = useRouter();

  const { address, isConnected, status } = useAccount();
  const { data: profilesResponse, isLoading: isLoadingProfiles } = useGetProfilesOwned({}, address);

  const { data: ensData, isLoading: isLoadingENS } = useENS(address);
  const [defaultProfile, setDefaultProfile] = useState<Profile>();
  const [isHost, setIsHost] = useState(false);

  const {
    data: signResult,
    error: signError,
    signMessage,
  } = useSignMessage({
    onSuccess: () => {
      setIsHost(true);
    },
  });

  const roomName = "c3577427-f8b9-44e3-bb4f-2c8dce0f1462";
  // const roomName = handle;
  const userIdentity = useMemo(() => address ?? "user-identity", [address]);

  useEffect(() => {
    if (!isLoadingProfiles) {
      // @ts-ignore
      setDefaultProfile(profilesResponse ? profilesResponse?.defaultProfile : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isLoadingProfiles]);

  const preJoinSubmit = (values: LocalUserChoices) => {
    console.log("Joining with: ", values);
    // check for host
    // if(defaultProfile?.id === clubSpaceObject.creatorLensProfileId)
    if (defaultProfile && defaultProfile?.handle === handle) {
      const message = `I am the host ${handle}`;
      signMessage({ message });
      if (signError) {
        alert("failed to verify host");
      } else {
        // set host or smth in metadata
        setIsHost(true);
      }
    }

    setPreJoinChoices(values);
  };

  // if (!isConnected) {
  //   return (
  //     <div>
  //       <ConnectWallet />
  //     </div>
  //   );
  // }

  if (isConnected && !isLoadingProfiles && defaultProfile && defaultProfile?.handle === handle && !signResult) {
    const message = `I am the host ${handle}`;
    return (
      <div>
        I see you're the host, please sign this message.
        <button className="btn" onClick={() => signMessage({ message })}>
          I'm the host
        </button>
      </div>
    );
  }

  if (status !== "connected" && (isLoadingProfiles || isLoadingENS)) {
    return <>loading...</>;
  }

  if (status === "connected" && userIdentity === "user-identity") {
    return <>loading...</>;
  }

  return (
    <>
      {spaceType === "video" && (
        <LiveVideo
          preJoinSubmit={preJoinSubmit}
          roomName={roomName}
          preJoinChoices={preJoinChoices}
          userIdentity={userIdentity}
          isHost={isHost}
        />
      )}
      {spaceType === "discussion" && (
        <LiveDiscussion
          // preJoinSubmit={preJoinSubmit}
          roomName={roomName}
          // preJoinChoices={preJoinChoices}
          userIdentity={userIdentity}
          isHost={isHost}
        />
      )}
      {spaceType === "playlist" && <>go to old infra</>}
    </>
  );
}

// export function Stage() {
//   const tracks = useTracks([
//     { source: Track.Source.Camera, withPlaceholder: true },
//     { source: Track.Source.ScreenShare, withPlaceholder: false },
//   ]);
//   return (
//     <>
//       <div className="">
//         <GridLayout tracks={tracks}>
//           <TrackContext.Consumer>
//             {(track) =>
//               track && (
//                 <div className="my-tile">
//                   {isTrackReference(track) ? <VideoTrack {...track} /> : <p>Camera placeholder</p>}
//                   <div className="flex justify-between items-center">
//                     <div style={{ display: "flex" }}>
//                       <TrackMutedIndicator source={Track.Source.Microphone}></TrackMutedIndicator>
//                       <TrackMutedIndicator source={track.source}></TrackMutedIndicator>
//                     </div>
//                     {/* Overwrite styles: By passing class names, we can easily overwrite/extend the existing styles. */}
//                     {/* In addition, we can still specify a style attribute and further customize the styles. */}
//                     <ParticipantName
//                       className="text-red-500"
//                       // style={{ color: 'blue' }}
//                     />
//                     {/* Custom components: Here we replace the provided <ConnectionQualityIndicator />  with our own implementation. */}
//                     <UserDefinedConnectionQualityIndicator />
//                   </div>
//                 </div>
//               )
//             }
//           </TrackContext.Consumer>
//         </GridLayout>
//       </div>
//     </>
//   );
// }

// export function UserDefinedConnectionQualityIndicator(props: HTMLAttributes<HTMLSpanElement>) {
//   /**
//    *  We use the same React hook that is used internally to build our own component.
//    *  By using this hook, we inherit all the state management and logic and can focus on our implementation.
//    */
//   const { quality } = useConnectionQualityIndicator();

//   function qualityToText(quality: ConnectionQuality): string {
//     switch (quality) {
//       case ConnectionQuality.Unknown:
//         return "No idea";
//       case ConnectionQuality.Poor:
//         return "Poor";
//       case ConnectionQuality.Good:
//         return "Good";
//       case ConnectionQuality.Excellent:
//         return "Excellent";
//     }
//   }

//   return <span {...props}> {qualityToText(quality)} </span>;
// }
