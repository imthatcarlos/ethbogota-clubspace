import { env } from "@/env.mjs";
import {
  ControlBar,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  LiveKitRoom,
  ParticipantLoop,
  RoomAudioRenderer,
  RoomName,
  TrackContext,
  TrackLoop,
  UseTokenOptions,
  VideoTrack,
  VideoConference,
  useIsSpeaking,
  useParticipantContext,
  useParticipants,
  useRoomInfo,
  useToken,
  useTracks,
} from "@livekit/components-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Participant, Track } from "livekit-client";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { useEffect, useMemo, useState } from "react";
import jwt, { type JwtPayload } from "jwt-decode";
import { DebugMode } from "@/lib/livekit/Debug";
import Chat from "../Chat";

const liveKitUrl = env.NEXT_PUBLIC_LIVEPEER_URL;

const tokenFetcher = async (tokenEndpoint: string | undefined, roomName: string, options: UseTokenOptions = {}) => {
  if (tokenEndpoint === undefined) {
    throw Error("token endpoint needs to be defined");
  }
  if (options.userInfo?.identity === undefined) {
    return;
  }
  // log.debug('fetching token');
  const params = new URLSearchParams({ ...options.userInfo, roomName });
  const res = await fetch(`${tokenEndpoint}?${params.toString()}`);
  const { accessToken } = await res.json();
  return { token: accessToken };
};

const useCachedToken = () => {};

export const LiveVideo = ({
  roomName,
  isHost,
  userIdentity,
}: {
  roomName: string;
  isHost?: boolean;
  userIdentity: string;
}) => {
  // const SESSION_VIEWER_TOKEN_KEY = `${roomName}-${userIdentity}`;
  // console.log("SESSION_VIEWER_TOKEN_KEY", SESSION_VIEWER_TOKEN_KEY);
  // const [token, setToken] = useState("");
  // const [queryEnabled, setQueryEnabled] = useState(false);

  const [tryToConnect, setTryToConnect] = useState(false);
  const [connected, setConnected] = useState(false);

  // useQuery({
  //   queryKey: ["token", SESSION_VIEWER_TOKEN_KEY],
  //   queryFn: () =>
  //     tokenFetcher(env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, roomName, {
  //       userInfo: {
  //         identity: userIdentity,
  //         name: userIdentity,
  //         metadata: isHost ? JSON.stringify({ isHost }) : undefined,
  //       },
  //     }),
  //   onSuccess: (data) => {
  //     // const payload: JwtPayload = jwt(data?.token);

  //     // if (payload.jti) {
  //     //   setViewerName(payload.jti);
  //     // }

  //     setToken(data?.token);
  //     sessionStorage.setItem(SESSION_VIEWER_TOKEN_KEY, data?.token);
  //   },
  //   enabled: queryEnabled,
  //   refetchOnMount: false,
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  //   retry: false,
  // });

  const userInfo = useMemo(() => {
    return {
      identity: userIdentity,
      name: userIdentity,
      metadata: isHost ? JSON.stringify({ isHost }) : undefined,
    };
  }, [userIdentity, isHost]);

  // console.log("userInfo", userInfo);

  const token = useToken(env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, roomName, { userInfo });

  // NOTE: This is a hack to persist the viewer token in the session storage
  // so that the client doesn't have to create a viewer token every time they
  // navigate back to the page.
  // useEffect(() => {
  //   const sessionToken = sessionStorage.getItem(SESSION_VIEWER_TOKEN_KEY);

  //   if (sessionToken) {
  //     const payload: JwtPayload = jwt(sessionToken);

  //     if (payload.exp) {
  //       const expiry = new Date(payload.exp * 1000);
  //       if (expiry < new Date()) {
  //         sessionStorage.removeItem(SESSION_VIEWER_TOKEN_KEY);
  //         setQueryEnabled(true);
  //         return;
  //       }
  //     }

  //     // if (payload.jti) {
  //     //   setViewerName(payload.jti);
  //     // }

  //     setToken(sessionToken);
  //   } else {
  //     setQueryEnabled(true);
  //   }
  // }, [SESSION_VIEWER_TOKEN_KEY]);

  return (
    <div data-lk-theme="default" className="w-full h-full min-h-[50%] overflow-hidden">
      <LiveKitRoom
        token={token}
        serverUrl={liveKitUrl}
        connect={tryToConnect}
        video={isHost}
        audio={isHost}
        // simulateParticipants={5}
        onConnected={() => setConnected(true)}
        onDisconnected={() => {
          setTryToConnect(false);
          setConnected(false);
        }}
        className="flex flex-1 flex-col"
      >
        <div className="flex h-full flex-1">
          {!connected ? (
            <button
              className="btn max-w-fit self-center justify-self-center"
              onClick={() => {
                setTryToConnect(true);
              }}
            >
              Enter Room
            </button>
          ) : (
            <div className="flex flex-1 h-full">
              <div className="sticky hidden w-80 border-r dark:border-zinc-800 dark:bg-zinc-900 lg:block">
                <div className="absolute left-0 top-0 bottom-0 flex h-full w-full flex-col gap-2 px-4 py-2">
                  <Sidebar isHost={isHost} />
                </div>
              </div>
              <div className="flex flex-1 flex-col dark:border-t-zinc-200 dark:bg-black">
                <Stage isHost={isHost} />
                <ControlBar variation="minimal" controls={{ microphone: true, camera: true, screenShare: false }} />
                <RoomAudioRenderer />
              </div>
              <div className="sticky hidden w-80 border-l dark:border-zinc-800 dark:bg-zinc-900 md:block">
                <div className="absolute top-0 bottom-0 right-0 flex h-full w-full flex-col gap-2 p-2">
                  <Chat viewerName={userIdentity} />
                </div>
              </div>
              {/* <DebugMode /> */}
            </div>
          )}
        </div>
      </LiveKitRoom>
    </div>
  );
};

const Sidebar = ({ isHost }) => {
  const participants = useParticipants();
  return (
    <>
      <div className="text-lg font-bold">Listening now</div>
      <ul className="space-y-4 max-w-fit">
        <ParticipantLoop participants={participants}>
          <ParticipantList isHost={isHost} />
        </ParticipantLoop>
      </ul>
    </>
  );
};

const ParticipantList = ({ isHost }) => {
  const participant = useParticipantContext();
  const participantPermissions = participant.permissions;

  const room = useRoomInfo();

  const { mutate: muteParticipant } = useMutation({
    mutationFn: (participant: Participant) => {
      return fetch("/api/room/muteParticipant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identity: participant.identity,
          roomName: room.name,
          canPublish: participant.permissions.canPublish,
        }),
      });
    },
  });

  return (
    <li className="flex items-start justify-between max-w-fit">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="h-8 w-8 rounded-full bg-blue-300"
          src={`https://api.dicebear.com/5.x/open-peeps/svg?seed=${participant.identity}&size=32&face=smile,cute`}
          alt={`Avatar of user: ${participant.identity}`}
        />
        <div className="flex flex-col max-w-fit">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold truncate max-w-[15ch]">{participant.name}</div>
          </div>
          {isHost && (
            <button className="w-fit btn p-2" onClick={() => muteParticipant(participant)}>
              {participantPermissions?.canPublish ? "🚫 Mute" : "Promote 🎙"}
            </button>
          )}
          {/* <div className="text-sm opacity-80">Promote speaker</div> */}
        </div>
        {isHost && <div className="text-sm">Host</div>}
      </div>
    </li>
  );
};

const Stage = ({ isHost }) => {
  // const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

  // console.log("tracks", tracks);

  return (
    <div className="">
      <div className="grid grid-cols-8 grid-rows-[auto] w-full h-full justify-center">
        <TrackLoop tracks={tracks}>
          <TrackContext.Consumer>
            {/* {(track) => track && <VideoTrack {...track} />} */}
            {(track) => track && <CustomParticipantTile isHost={isHost} track={track} key={track.participant.sid} />}
          </TrackContext.Consumer>
        </TrackLoop>
        {/* <ParticipantLoop participants={participants}>
          <CustomParticipantTile isHost={isHost}></CustomParticipantTile>
        </ParticipantLoop> */}
      </div>
    </div>
  );
};

const CustomParticipantTile = ({ isHost, track }: { isHost: boolean; track: TrackReferenceOrPlaceholder }) => {
  return (
    <section className="relative min-w-0" title={track.participant.name}>
      <div className="relative w-32 h-32 rounded">
        <VideoTrack {...track} />
        <span className="absolute top-0 left-0">{isHost && "host"}</span>
        <span className="absolute bottom-0 left-0">mute</span>
        {/* <span className="absolute bottom-0 right-0">promote</span> */}
      </div>
    </section>
  );
};

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
