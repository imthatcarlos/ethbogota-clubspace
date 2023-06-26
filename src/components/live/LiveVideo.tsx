import {
  LiveKitRoom,
  useToken,
  VideoConference,
  formatChatMessageLinks,
  LocalUserChoices,
  PreJoin,
} from "@livekit/components-react";
import { LogLevel, VideoPresets, RoomOptions } from "livekit-client";

import { DebugMode } from "@/lib/livekit/Debug";
import React, { useMemo } from "react";
import { env } from "@/env.mjs";
import { useRouter } from "next/router";

const liveKitUrl = env.NEXT_PUBLIC_LIVEPEER_URL;

export const LiveVideo = ({
  roomName,
  preJoinChoices,
  isHost,
  userIdentity,
  preJoinSubmit,
}: {
  roomName: string;
  preJoinChoices: LocalUserChoices | undefined;
  isHost?: boolean;
  userIdentity: string;
  preJoinSubmit: (value: LocalUserChoices) => void;
}) => {
  const router = useRouter();
  return (
    <div data-lk-theme="default">
      {roomName && !Array.isArray(roomName) && preJoinChoices ? (
        <ActiveRoom
          roomName={roomName}
          userChoices={preJoinChoices}
          onLeave={() => {
            router.push("/");
          }}
          isHost={isHost}
        ></ActiveRoom>
      ) : (
        <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
          {/* {defaultProfile?.handle ? defaultProfile?.handle : "no default...  "}
          {ensData?.handle ? ensData?.handle : "no ens..."}
          {address ? address : "no address ..."} */}
          <PreJoin
            onError={(err) => console.log("error while setting up prejoin", err)}
            defaults={{
              username: userIdentity,
              videoEnabled: true,
              audioEnabled: true,
            }}
            onSubmit={(values) => {
              preJoinSubmit(values);
            }}
          ></PreJoin>
        </div>
      )}
    </div>
  );
};

type ActiveRoomProps = {
  userChoices: LocalUserChoices;
  roomName: string;
  region?: string;
  onLeave?: () => void;
  isHost?: boolean;
};
const ActiveRoom = ({ roomName, userChoices, onLeave, isHost }: ActiveRoomProps) => {
  const token = useToken(env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, roomName, {
    userInfo: {
      identity: userChoices.username,
      name: userChoices.username,
    },
  });

  const router = useRouter();
  const { region, hq } = router.query;

  // const liveKitUrl = useServerUrl(region as string | undefined);

  const roomOptions = useMemo((): RoomOptions => {
    return {
      videoCaptureDefaults: {
        deviceId: userChoices.videoDeviceId ?? undefined,
        resolution: hq === "true" ? VideoPresets.h2160 : VideoPresets.h720,
      },
      publishDefaults: {
        videoSimulcastLayers:
          hq === "true" ? [VideoPresets.h1080, VideoPresets.h720] : [VideoPresets.h540, VideoPresets.h216],
      },
      audioCaptureDefaults: {
        deviceId: userChoices.audioDeviceId ?? undefined,
      },
      adaptiveStream: { pixelDensity: "screen" },
      dynacast: true,
    };
  }, [userChoices, hq]);

  return (
    <>
      {liveKitUrl && (
        <LiveKitRoom
          token={token}
          serverUrl={liveKitUrl}
          options={roomOptions}
          video={userChoices.videoEnabled}
          audio={userChoices.audioEnabled}
          onDisconnected={onLeave}
        >
          <VideoConference chatMessageFormatter={formatChatMessageLinks} />
          {isHost ? "HOST" : "NOT HOST"}
          <DebugMode logLevel={LogLevel.info} />
        </LiveKitRoom>
      )}
    </>
  );
};
