import {
  ControlBar,
  LiveKitRoom,
  RoomAudioRenderer,
  RoomName,
  TrackLoop,
  TrackMutedIndicator,
  useIsMuted,
  useIsSpeaking,
  useToken,
  useTrackContext,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useMemo, useState } from "react";
import { env } from "@/env.mjs";

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
            <Stage />
            <ControlBar variation="minimal" controls={{ microphone: true, camera: false, screenShare: false }} />
            <RoomAudioRenderer />
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
};

const Stage = () => {
  const tracksReferences = useTracks([Track.Source.Microphone]);
  return (
    <div className="">
      <div className="grid grid-cols-8 grid-rows-[auto] w-full h-full justify-center">
        <TrackLoop tracks={tracksReferences}>
          <CustomParticipantTile></CustomParticipantTile>
        </TrackLoop>
      </div>
    </div>
  );
};

const CustomParticipantTile = () => {
  const { participant, source } = useTrackContext();
  const isSpeaking = useIsSpeaking(participant);
  const isMuted = useIsMuted(source);

  const id = useMemo(() => participant.identity, [participant]);

  return (
    <section className="relative min-w-0" title={participant.name}>
      <div className="relative w-24 h-24 min-w-0">
        <div
          className={`rounded-full border-2 p-0.5 transition-colors duration-1000`}
          style={{ borderColor: isSpeaking ? "greenyellow" : "transparent" }}
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
          style={{ opacity: isMuted ? 1 : 0 }}
          className="absolute bg-red-500 bottom-[7%] right-[7%] rounded-full transition-opacity duration-200 ease-in-out border-2 border-emerald-600 p-1"
        >
          <div className="aspect-square grid place-content-center">
            <TrackMutedIndicator className="m-1 opacity-100" source={source}></TrackMutedIndicator>
          </div>
        </div>
      </div>
      {/* find way to control other users sources */}
      {/* {isHost && (
        <div>
          <ControlBar variation="minimal" controls={{ microphone: true, camera: false, screenShare: false }} />
        </div>
      )} */}
    </section>
  );
};
export default LiveDiscussion;
