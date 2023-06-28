import { env } from "@/env.mjs";
import { classNames } from "@/lib/utils/classNames";
import {
  ControlBar,
  LiveKitRoom,
  ParticipantLoop,
  RoomAudioRenderer,
  RoomName,
  useIsSpeaking,
  useParticipantContext,
  useParticipants,
  useRoomInfo,
  useToken,
} from "@livekit/components-react";
import { useMutation } from "@tanstack/react-query";
import { Participant } from "livekit-client";
import { useMemo, useState } from "react";

const liveKitUrl = env.NEXT_PUBLIC_LIVEPEER_URL;

export const LiveDiscussion = ({
  roomName,
  isHost,
  userIdentity,
}: {
  roomName: string;
  isHost?: boolean;
  userIdentity: string;
}) => {
  const token = useToken(env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, roomName, {
    userInfo: {
      identity: userIdentity,
      name: userIdentity,
      metadata: isHost ? JSON.stringify({ isHost }) : undefined,
    },
  });

  const [tryToConnect, setTryToConnect] = useState(false);
  const [connected, setConnected] = useState(false);

  return (
    <div data-lk-theme="default" className="relative w-full h-screen max-h-screen overflow-hidden">
      <LiveKitRoom
        token={token}
        serverUrl={liveKitUrl}
        connect={tryToConnect}
        video={false}
        audio={true}
        // simulateParticipants={5}
        onConnected={() => setConnected(true)}
        onDisconnected={() => {
          setTryToConnect(false);
          setConnected(false);
        }}
      >
        <div className="grid place-content-center h-full">
          <button
            className="lk-button"
            onClick={() => {
              setTryToConnect(true);
            }}
          >
            Enter Room
          </button>

          <div
            className="w-full max-w-full bottom-0 absolute px-8 h-[80%] p-4 bg-slate-600 transition-all duration-1000 grid grid-rows-[min-content_1fr_min-content]"
            style={{ bottom: connected ? "0px" : "-100%" }}
          >
            <h1>
              <RoomName />
            </h1>
            <Stage isHost={isHost} />
            <ControlBar variation="minimal" controls={{ microphone: true, camera: false, screenShare: false }} />
            <RoomAudioRenderer />
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
};

const Stage = ({ isHost }) => {
  const participants = useParticipants();
  return (
    <div className="">
      <div className="grid grid-cols-8 grid-rows-[auto] w-full h-full justify-center">
        <ParticipantLoop participants={participants}>
          <CustomParticipantTile isHost={isHost}></CustomParticipantTile>
        </ParticipantLoop>
      </div>
    </div>
  );
};

const CustomParticipantTile = ({ isHost }: { isHost: boolean }) => {
  // const { participant, source } = useTrackContext();
  const participant = useParticipantContext();
  // const { source } = participant && participant.getTrackByName(Track.Source.Microphone);

  const isSpeaking = useIsSpeaking(participant);
  const isMuted = !participant.isMicrophoneEnabled;
  // useIsMuted(source);
  const room = useRoomInfo();
  const participantPermissions = participant.permissions;

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

  const id = useMemo(() => participant.identity, [participant]);

  return (
    <section className="relative min-w-0" title={participant.name} key={participant.name}>
      <div className="relative w-24 h-24 min-w-0">
        <div
          className={classNames(
            `rounded-full border-2 p-0.5 transition-colors duration-1000`,
            isSpeaking ? "border-tranparent" : "glowing-border-club"
          )}
          // style={{ borderColor: isSpeaking ? "greenyellow" : "transparent" }}
        >
          <div className="z-10 grid aspect-square items-center overflow-hidden rounded-full bg-beige transition-all will-change-transform">
            <img
              src={`https://avatars.dicebear.com/api/avataaars/${id}.svg?mouth=default,smile,tongue&eyes=default,happy,hearts&eyebrows=default,defaultNatural,flatNatural`}
              className="fade-in"
              width={150}
              height={150}
              alt={`Avatar of user: ${participant.identity}`}
            />
          </div>
        </div>

        <div
          style={{ opacity: isMuted || !participantPermissions?.canPublish ? 1 : 0 }}
          className="absolute bg-red-500 bottom-[7%] right-[7%] rounded-full transition-opacity duration-200 ease-in-out border-2 border-emerald-600 p-1"
        >
          <div className="aspect-square grid place-content-center">
            {isMuted && "isMuted"}
            {!participantPermissions?.canPublish && "!canPublish"}
            {/* <TrackMutedIndicator className="m-1 opacity-100" source={source}></TrackMutedIndicator> */}
          </div>
        </div>
      </div>
      {/* find way to control other users sources */}
      {isHost && (
        <button onClick={() => muteParticipant(participant)}>toggle mute</button>
        // <ControlBar
        //   key={participant.sid}
        //   variation="minimal"
        //   controls={{ microphone: true, camera: false, screenShare: false }}
        // />
      )}
    </section>
  );
};
export default LiveDiscussion;
