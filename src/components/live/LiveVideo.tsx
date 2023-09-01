import { env } from "@/env.mjs";
import { ControlBar, LiveKitRoom, RoomAudioRenderer, useToken } from "@livekit/components-react";
import { useMemo, useState } from "react";
// import jwt, { type JwtPayload } from "jwt-decode";
import { DebugMode } from "@/lib/livekit/Debug";
import Chat from "../Chat";
// import { ParticipantList } from "../videoSpace/ParticipantList";
import { Stage } from "../videoSpace/Stage";
import { ParticipantDialogList } from "../videoSpace/ParticipantDialogList";
import { DefaultLensProfile } from "@/types/lens";

const liveKitUrl = env.NEXT_PUBLIC_LIVEPEER_URL;

export const LiveVideo = ({
  roomName,
  isHost,
  userIdentity,
  defaultProfile,
}: {
  roomName: string;
  isHost?: boolean;
  userIdentity: string;
  defaultProfile: DefaultLensProfile | undefined;
}) => {
  const [tryToConnect, setTryToConnect] = useState(false);
  const [connected, setConnected] = useState(false);

  const metadata = useMemo(() => {
    try {
      let str = JSON.stringify({
        defaultProfile: defaultProfile ?? undefined,
        isHost: isHost ?? undefined,
      });
      return str;
    } catch (err) {
      console.log("failed to stringify metadata");
      return undefined;
    }
  }, [isHost, defaultProfile]);

  const userInfo = useMemo(() => {
    return {
      identity: userIdentity,
      name: userIdentity,
      metadata,
    };
  }, [userIdentity, metadata]);

  const token = useToken(env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, roomName, { userInfo });

  return (
    <div data-lk-theme="default" className="w-full h-[100dvh] overflow-hidden">
      <LiveKitRoom
        token={token}
        serverUrl={liveKitUrl}
        connect={tryToConnect}
        video={isHost}
        audio={isHost}
        // simulateParticipants={2}
        onConnected={() => setConnected(true)}
        onDisconnected={() => {
          setTryToConnect(false);
          setConnected(false);
        }}
        className="flex flex-1 flex-col h-full"
      >
        <div className="flex h-full flex-1 min-h-[80dvh]">
          {!connected ? (
            <div className="w-full flex items-center justify-center">
              <button
                className="btn max-w-fit self-center justify-self-center"
                onClick={() => {
                  setTryToConnect(true);
                }}
              >
                Enter Room
              </button>
            </div>
          ) : (
            <div className="flex flex-1 h-full">
              {/* <div className="sticky hidden w-80 border-r dark:border-zinc-800 dark:bg-zinc-900 lg:block">
                <div className="absolute left-0 top-0 bottom-0 flex h-full w-full flex-col gap-2 px-4 py-2">
                  <Sidebar isHost={isHost} />
                </div>
              </div> */}
              <div className="flex flex-1 flex-col min-h-[80dvh] dark:border-t-zinc-200 dark:bg-black py-4">
                <Stage />
                <div className="flex flex-1 gap-2 w-full items-center justify-center">
                  <ControlBar
                    variation="minimal"
                    controls={{ microphone: true, camera: true, screenShare: false }}
                    className="border-none gap-2 flex items-center"
                  />
                  <ParticipantDialogList />
                </div>
                <RoomAudioRenderer />
              </div>
              <div className="sticky hidden w-80 border-l dark:border-zinc-800 dark:bg-zinc-900 md:block">
                <div className="absolute top-0 bottom-0 right-0 flex h-full w-full flex-col gap-2 p-2">
                  <Chat viewerName={userIdentity} />
                </div>
              </div>
              <DebugMode />
            </div>
          )}
        </div>
      </LiveKitRoom>
    </div>
  );
};

// const Sidebar = ({ isHost }) => {
//   const participants = useParticipants();
//   return (
//     <>
//       <div className="text-lg font-bold">Listening now</div>
//       <ul className="space-y-4 max-w-fit">
//         <ParticipantLoop participants={participants}>
//           <ParticipantList isHost={isHost} />
//         </ParticipantLoop>
//       </ul>
//     </>
//   );
// };

// const CustomParticipantTile = ({ isHost }: { isHost: boolean }) => {
//   // const { participant, source } = useTrackContext();
//   const participant = useParticipantContext();
//   // const { source } = participant && participant.getTrackByName(Track.Source.Microphone);

//   const isSpeaking = useIsSpeaking(participant);
//   const isMuted = !participant.isMicrophoneEnabled;
//   // useIsMuted(source);
//   const room = useRoomInfo();

//   const participantPermissions = participant.permissions;

//   const { mutate: muteParticipant } = useMutation({
//     mutationFn: (participant: Participant) => {
//       return fetch("/api/room/muteParticipant", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           identity: participant.identity,
//           roomName: room.name,
//           canPublish: participant.permissions.canPublish,
//         }),
//       });
//     },
//   });

//   const id = useMemo(() => participant.identity, [participant]);

//   return (
//     <section className="relative min-w-0" title={participant.name} key={participant.name}>
//       <div className="relative w-24 h-24 min-w-0">
//         <div
//           className={classNames(
//             `rounded-full border-2 p-0.5 transition-colors duration-1000`,
//             // can have just regular border as we now have access to speaking source to update in real time
//             isSpeaking ? "border-tranparent" : "glowing-border-club"
//           )}
//         >
//           <div className="z-10 grid aspect-square items-center overflow-hidden rounded-full bg-beige transition-all will-change-transform">
//             <img
//               // @TODO: swap with lens pic
//               src={`https://avatars.dicebear.com/api/avataaars/${id}.svg?mouth=default,smile,tongue&eyes=default,happy,hearts&eyebrows=default,defaultNatural,flatNatural`}
//               className="fade-in"
//               width={150}
//               height={150}
//               alt={`Avatar of user: ${participant.identity}`}
//             />
//           </div>
//         </div>

//         <div
//           style={{ opacity: isMuted || !participantPermissions?.canPublish ? 1 : 0 }}
//           className="absolute bg-red-500 bottom-[7%] right-[7%] rounded-full transition-opacity duration-200 ease-in-out border-2 border-emerald-600 p-1"
//         >
//           <div className="aspect-square grid place-content-center">
//             {isMuted && "iM"}
//             {!participantPermissions?.canPublish && "!cP"}
//             {/* <TrackMutedIndicator className="m-1 opacity-100" source={source}></TrackMutedIndicator> */}
//           </div>
//         </div>
//       </div>
//       {/* @TODO: only show to not hosts */}
//       {isHost && (
//         <button onClick={() => muteParticipant(participant)}>
//           {participantPermissions?.canPublish ? "🚫 Mute" : "Promote 🎙"}
//         </button>
//       )}
//     </section>
//   );
// };
export default LiveVideo;
