import { env } from "@/env.mjs";
import { LiveKitRoom, RoomAudioRenderer, useToken } from "@livekit/components-react";
import { useEffect, useMemo, useState } from "react";
// import jwt, { type JwtPayload } from "jwt-decode";
import Chat from "../Chat";
// import { ParticipantList } from "../videoSpace/ParticipantList";
import useIsMounted from "@/hooks/useIsMounted";
import { DefaultLensProfile } from "@/types/lens";
import { useAccount } from "wagmi";
import { Footer } from "../MadfiFooter";
import { HostInfo } from "../videoSpace/HostInfo";
import SponsoredPost from "../videoSpace/SponsoredPost";
import { Stage } from "../videoSpace/Stage";

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
  const { address, isConnected } = useAccount();
  const isMounted = useIsMounted();
  const [tryToConnect, setTryToConnect] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isMounted) {
      setTryToConnect(true);
    }
  }, [isMounted]);

  const metadata = useMemo(() => {
    if (!isConnected) return;

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
  }, [defaultProfile, ensData, address, isConnected]);

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
    <div className="w-full bg-background" style={{ height: 'calc(100vh - 88px)' }}>
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
        <div className="flex md:max-w-[85%] max-width-[100%] mx-auto items-center w-full h-[100%] min-[1921px]:h-[80%] md:mb-18">
          <div className="flex md:gap-9 flex-1 h-full md:h-auto">
            <div className="flex-1 max-w-fit h-full md:h-auto">
              <div className="relative h-full md:h-auto">
                <Stage space={space} />
              </div>
              <div className={`w-full ${space.creatorAddress !== address ? 'mt-16' : 'mt-8'}`}>
                <HostInfo space={space} />
              </div>
              <RoomAudioRenderer />
            </div>

            <div className="w-full max-w-sm rounded-2xl pt-4 max-h-[80%]">
              <SponsoredPost space={space} />
              <Chat viewerName={userIdentity} />
            </div>
          </div>
          {/* <DebugMode /> */}
        </div>
      </LiveKitRoom>
      <span className="md:block hidden">
        <Footer />
      </span>
    </div>
  );
};

export default LiveVideo;
