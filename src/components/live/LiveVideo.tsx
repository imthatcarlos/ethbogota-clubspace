import { env } from "@/env.mjs";
import {
  ControlBar,
  LiveKitRoom,
  ParticipantLoop,
  RoomAudioRenderer,
  useParticipantContext,
  useParticipants,
  useToken,
} from "@livekit/components-react";
import { useEffect, useMemo, useState } from "react";
// import jwt, { type JwtPayload } from "jwt-decode";
import { DebugMode } from "@/lib/livekit/Debug";
import Chat from "../Chat";
// import { ParticipantList } from "../videoSpace/ParticipantList";
import useIsMounted from "@/hooks/useIsMounted";
import { DefaultLensProfile } from "@/types/lens";
import { ParticipantDialogList } from "../videoSpace/ParticipantDialogList";
import { PinnedPromotionDialog } from "../videoSpace/PinnedPromotionDialog";
import { Stage } from "../videoSpace/Stage";

const liveKitUrl = env.NEXT_PUBLIC_LIVEPEER_URL;

export const LiveVideo = ({
  roomName,
  isHost,
  userIdentity,
  defaultProfile,
  ensData,
  space,
}: {
  roomName: string;
  isHost?: boolean;
  userIdentity: string;
  defaultProfile?: DefaultLensProfile;
  ensData?: any;
  space: any;
}) => {
  const isMounted = useIsMounted();
  const [tryToConnect, setTryToConnect] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isMounted) {
      setTryToConnect(true);
    }
  }, [isMounted]);

  const metadata = useMemo(() => {
    try {
      let str = JSON.stringify({
        defaultProfile: defaultProfile ?? undefined,
        ensData: ensData ?? undefined,
        isHost: isHost ?? undefined,
      });
      return str;
    } catch (err) {
      console.log("failed to stringify metadata");
      return undefined;
    }
  }, [isHost]);

  const userInfo = useMemo(() => {
    return {
      identity: userIdentity,
      name: userIdentity,
      metadata,
    };
  }, [userIdentity, metadata]);

  const token = useToken(env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, roomName, { userInfo });

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-background">
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
      >
        <div className="flex max-w-[80%] mx-auto items-center w-full h-[80%]">
          {/* <div className="sticky hidden w-80 border-r dark:border-zinc-800 dark:bg-zinc-900 lg:block">
                <div className="absolute left-0 top-0 bottom-0 flex h-full w-full flex-col gap-2 px-4 py-2">
                  <Sidebar isHost={isHost} />
                </div>
              </div> */}
          <div className="flex gap-9">
            <div className="flex-1">
              <Stage />
              <div className="flex flex-1 gap-2 w-full items-center justify-center">
                <ParticipantList />
                <ParticipantDialogList />
                <PinnedPromotionDialog space={space} />
              </div>
              <RoomAudioRenderer />
            </div>

            <div className="w-80">
              <Chat viewerName={userIdentity} />
            </div>
          </div>
          <DebugMode />
        </div>
      </LiveKitRoom>
    </div>
  );
};

const ParticipantList = () => {
  const participants = useParticipants();

  return (
    <ParticipantLoop participants={participants}>
      <ParticipantControls />
    </ParticipantLoop>
  );
};

const ParticipantControls = () => {
  const participant = useParticipantContext();
  const permissions = participant.permissions;

  if (permissions && permissions.canPublish) {
    return (
      <ControlBar
        variation="minimal"
        controls={{ microphone: true, camera: true, screenShare: true }}
        className="border-none gap-2 flex items-center"
      />
    );
  }
  return null;
};

export default LiveVideo;
