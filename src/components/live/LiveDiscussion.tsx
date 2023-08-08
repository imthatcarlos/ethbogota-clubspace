import { reactionsEntries } from "@/constants/reactions";
import { env } from "@/env.mjs";
import { classNames } from "@/lib/utils/classNames";
import { Menu, Popover, Transition } from "@headlessui/react";
import {
  ControlBar,
  LiveKitRoom,
  ParticipantLoop,
  RoomAudioRenderer,
  RoomName,
  useParticipants,
  useToken,
} from "@livekit/components-react";
import { useMutation } from "@tanstack/react-query";
import { DataPacket_Kind, Participant } from "livekit-client";
import { Fragment, useEffect, useState } from "react";

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
        audio={isHost}
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
  const participants = useParticipants();

  return (
    <div className="">
      <div className="grid grid-cols-8 grid-rows-[auto] w-full h-full justify-center">
        <ParticipantLoop participants={participants}>
          <CustomParticipantTile />
        </ParticipantLoop>
      </div>
    </div>
  );
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

import { useDataChannel, useParticipantContext, useIsSpeaking, useRoomInfo } from "@livekit/components-react";
import { useAccount } from "wagmi";
import { useMemo } from "react";

const CustomParticipantTile = () => {
  // const { participant, source } = useTrackContext();
  const [localParticipantMessage, setLocalParticipantMessage] = useState<string | undefined>();
  const [remoteParticipantMessage, setRemoteParticipantMessage] = useState<string | undefined>();
  const participant = useParticipantContext();
  const participants = useParticipants();
  // @TODO: to create the "request to speak" I think we just need the address
  // then we can call the getParticipant on the server to livepeer and that has
  // the metadata, which gives the sid we need to send the message only to the host
  const { metadata, sid } = participant;

  const onMessage = (message: ReceivedDataMessage<"reactions">) => {
    setRemoteParticipantMessage(decoder.decode(message?.payload));
    console.warn(
      `%cmessage || decoded ${decoder.decode(message?.payload)}`,
      "🐦;background: lightblue; color: #444; padding: 3px; border-radius: 5px;"
    );
  };

  // @FIXME: for some reason, can't send more than one message
  const { message, send, isSending } = useDataChannel("reactions", onMessage);

  const { defaultProfile, isHost }: { defaultProfile: DefaultLensProfile; isHost: boolean } = useMemo(() => {
    if (!!metadata) {
      try {
        return JSON.parse(metadata);
      } catch (err) {
        console.error("couldn't parse metadata", err);
      }
    }
    return { defaultProfile: {}, isHost: false };
  }, [metadata]);
  // console.log(`metadata from participant ${sid}\n${metadata}`);
  // const { source } = participant && participant.getTrackByName(Track.Source.Microphone);
  const { address } = useAccount();

  const isSpeaking = useIsSpeaking(participant);
  const isMuted = !participant.isMicrophoneEnabled;
  // useIsMuted(source);
  // const room = useRoomInfo();

  const participantPermissions = participant.permissions;

  const handleMessageSend = async (payload: Uint8Array, options?: DataSendOptions): Promise<void> => {
    setLocalParticipantMessage(decoder.decode(payload));
    send(payload, options);
    return;
  };

  useEffect(() => {
    // hack local message
    let timeout: NodeJS.Timeout;
    if (localParticipantMessage) {
      timeout = setTimeout(() => {
        setLocalParticipantMessage(undefined);
      }, 2000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [localParticipantMessage]);

  useEffect(() => {
    // clear remote message
    let timeout: NodeJS.Timeout;
    if (remoteParticipantMessage) {
      timeout = setTimeout(() => {
        setRemoteParticipantMessage(undefined);
      }, 2000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [remoteParticipantMessage]);

  // const id = useMemo(() => defaultProfile?.handle ?? participant.identity, [participant]);

  return (
    <section className="relative min-w-0" title={participant.name} key={participant.name}>
      <div className="relative w-24 h-24 min-w-0">
        <div
          className={classNames(
            `rounded-full border-2 p-0.5 transition-colors duration-1000`,
            // can have just regular border as we now have access to speaking source to update in real time
            isSpeaking ? "border-tranparent" : "glowing-border-club"
          )}
        >
          <div className="z-10 grid aspect-square items-center overflow-hidden rounded-full bg-beige transition-all will-change-transform">
            <img
              src={defaultProfile ? getUrlForImageFromIpfs(defaultProfile?.picture?.original?.url) : "/anon.png"}
              alt={defaultProfile ? defaultProfile?.handle : participant.identity}
              className="fade-in"
              width={150}
              height={150}
            />
          </div>
        </div>
        {localParticipantMessage && (
          <div className="absolute bottom-0 right-0">
            <div className="opacity-0 flex items-center justify-center w-6 h-6 text-4xl rounded-full animate-fade-in-and-out-up">
              l{localParticipantMessage}
            </div>
          </div>
        )}
        {/* @FIXME: remoteParticipantMessage is being set even for local, may have to iterate all participants here*/}
        {remoteParticipantMessage && (
          <div className="absolute bottom-0 right-0">
            <div className="opacity-0 flex items-center justify-center w-6 h-6 text-4xl rounded-full animate-fade-in-and-out-up">
              r{remoteParticipantMessage}
            </div>
          </div>
        )}
        <div
          style={{ opacity: isMuted || !participantPermissions?.canPublish ? 1 : 0 }}
          className="absolute bg-red-500 bottom-[7%] right-[7%] rounded-full transition-opacity duration-200 ease-in-out border-2 border-emerald-600 p-1"
        >
          <div className="aspect-square grid place-content-center">
            {/* @FIXME: add better muted indicator */}
            {isMuted && "iM"}
            {!participantPermissions?.canPublish && "!cP"}
            {/* <TrackMutedIndicator className="m-1 opacity-100" source={source}></TrackMutedIndicator> */}
          </div>
        </div>
      </div>
      {!isHost && participant.name !== address && <HostSection />}
      {participant.name === address && <ReactionsDialog send={handleMessageSend} isSending={isSending} />}
    </section>
  );
};

const HostSection = () => {
  const participant = useParticipantContext();
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
  return (
    <>
      <button onClick={() => muteParticipant(participant)}>
        {participantPermissions?.canPublish ? "🚫 Mute" : "Promote 🎙"}
      </button>
    </>
  );
};

import type { ReceivedDataMessage, DataSendOptions } from "@livekit/components-core";
import { DefaultLensProfile } from "@/types/lens";
import { getUrlForImageFromIpfs } from "@/utils";

const ReactionsDialog = ({
  send,
  isSending,
}: {
  send: (payload: Uint8Array, options?: DataSendOptions) => Promise<void>;
  isSending: boolean;
}) => {
  return (
    <>
      <Popover
        className={({ open }) =>
          classNames(
            open ? "inset-0 z-40 overflow-y-auto" : "",
            "mx-auto shadow-sm lg:static bottom-0 lg:overflow-y-visible"
          )
        }
      >
        {({ open }) => {
          return (
            <>
              <Menu as="div" className="relative flex-shrink-0 mb-32">
                <div className="flex mt-10 items-center mx-auto">
                  <Menu.Button
                    title="Use these wisely..."
                    // @FIXME: isSending becomes true after sending ONE message
                    // disabled={isSending}
                    className="text-club-red !bg-transparent focus:outline-none rounded-lg text-sm text-center inline-flex items-center relative"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      // @FIXME: isSending becomes true after sending ONE message
                      // fill={!isSending ? "currentColor" : "gray"}
                      className="w-7 h-7"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>

                    <span className="sr-only">Response icon heart-shape</span>
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none flex gap-4 flex-wrap left-1/2 transform -translate-x-1/2">
                    {reactionsEntries.map(([key, value]) => (
                      <Menu.Item key={key}>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              try {
                                const data = encoder.encode(value);
                                send(data, { kind: DataPacket_Kind.RELIABLE });
                              } catch (error) {
                                console.log(error);
                              }
                            }}
                          >
                            {value}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>

              <Popover.Panel className="" aria-label="Global"></Popover.Panel>
            </>
          );
        }}
      </Popover>
    </>
  );
};
export default LiveDiscussion;
