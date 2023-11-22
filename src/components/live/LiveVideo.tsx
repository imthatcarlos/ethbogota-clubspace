import { env } from "@/env.mjs";
import { LiveKitRoom, RoomAudioRenderer, useToken } from "@livekit/components-react";
import { useEffect, useMemo, useState } from "react";
// import jwt, { type JwtPayload } from "jwt-decode";
import Chat from "../Chat";
// import { ParticipantList } from "../videoSpace/ParticipantList";
import useIsMounted from "@/hooks/useIsMounted";
import { DefaultLensProfile } from "@/types/lens";
import { Stage } from "../videoSpace/Stage";
import { HostInfo } from "../videoSpace/HostInfo";
import { useAccount } from "wagmi";
import { Footer } from "../MadfiFooter";
import SponsoredPost from "../videoSpace/SponsoredPost";

const liveKitUrl = env.NEXT_PUBLIC_LIVEPEER_URL;

export const LiveVideo = ({
  roomName,
  userIdentity,
  defaultProfile,
  ensData,
  space,
}: {
  roomName: string;
  userIdentity: string;
  defaultProfile?: DefaultLensProfile;
  ensData?: any;
  space: any;
}) => {
  const { address } = useAccount();
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
        address,
      });
      return str;
    } catch (err) {
      console.log("failed to stringify metadata");
      return undefined;
    }
  }, [defaultProfile, ensData, address]);

  const userInfo = useMemo(() => {
    return {
      identity: userIdentity,
      name: userIdentity,
      metadata,
      creatorAddress: space.creatorAddress,
    };
  }, [userIdentity, metadata, space]);

  const token = useToken(env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, roomName, { userInfo });

  return (
    <div className="w-full h-[95dvh] bg-background">
      <LiveKitRoom
        token={token}
        serverUrl={liveKitUrl}
        connect={tryToConnect}
        audio={true}
        // simulateParticipants={2}
        onConnected={() => setConnected(true)}
        onDisconnected={() => {
          setTryToConnect(false);
          setConnected(false);
        }}
      >
        <div className="flex max-w-[85%] mx-auto items-center w-full h-full min-[1921px]:h-[80%] mb-24">
          <div className="flex gap-9 mt-[5dvh] flex-1">
            <div className="flex-1">
              <div className="relative flex gap-16">
                <Stage space={space} />
                <div className="w-full">
                  <HostInfo space={space} />
                </div>
              </div>
              <RoomAudioRenderer />
            </div>

            <div className="w-full max-w-sm bg-foreground rounded-2xl pt-4 max-h-[80%]">
              <SponsoredPost space={space} />
              <Chat viewerName={userIdentity} />
            </div>
          </div>
          {/* <DebugMode /> */}
        </div>
      </LiveKitRoom>
      <Footer />
    </div>
  );
};

export default LiveVideo;
