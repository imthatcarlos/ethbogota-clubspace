import { useMemo } from "react";
import useENS from "@/hooks/useENS";
import { useGetProfilesOwned } from "@/services/lens/getProfile";
import { useParticipantContext, useRoomInfo } from "@livekit/components-react";
import { useMutation } from "@tanstack/react-query";
import { Participant } from "livekit-client";
import { DefaultLensProfile } from "@/types/lens";
import { getUrlForImageFromIpfs } from "@/utils";

export const ParticipantList = () => {
  const participant = useParticipantContext();
  const { defaultProfile, isHost }: { defaultProfile: DefaultLensProfile; isHost: boolean } = JSON.parse(
    participant.metadata
  );
  const participantPermissions = participant.permissions;

  // when setting up metadata, we add address as identity
  // but this could be a generated name
  const address = participant.name;
  const { data: ensData } = useENS(address);
  const room = useRoomInfo();

  const displayName = useMemo(() => {
    if (defaultProfile) {
      return defaultProfile.handle;
    }
    if (ensData && Object.keys(ensData) && ensData?.handle) {
      return ensData.handle;
    }
    return address;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, ensData, defaultProfile]);

  const avatar = useMemo(() => {
    if (defaultProfile) {
      return getUrlForImageFromIpfs(defaultProfile?.picture?.original?.url) ?? "/anon.png";
    }
    if (Object.keys(ensData) && ensData?.avatar) {
      return ensData.avatar ?? "/anon.png";
    }
    return "/anon.png";
    // return `https://api.dicebear.com/5.x/open-peeps/svg?seed=${address}&size=32&face=smile,cute`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, ensData, defaultProfile]);

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

  // @TODO: add loading state?
  return (
    <li className="flex items-start justify-between w-full">
      <div className="flex items-center gap-3 flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="h-8 w-8 rounded-full bg-blue-300" src={avatar} alt={`Avatar of user ${displayName}`} />
        <div className="flex flex-col max-w-fit">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold truncate max-w-[15ch]">
              {/* just in case we stringify it */}
              {displayName ? displayName : JSON.stringify(displayName)}
            </div>
          </div>
          {isHost && <div className="text-sm">Host</div>}
          {/* <div className="text-sm opacity-80">Promote speaker</div> */}
        </div>
      </div>

      <div className="justify-self-end flex flex-col items-center">
        {isHost && participant.name !== address && (
          <button
            className="w-fit rounded-full px-5 py-2 bg-almost-black text-white"
            onClick={() => muteParticipant(participant)}
          >
            {participantPermissions?.canPublish ? "🚫 Mute" : "Promote 🎙"}
          </button>
        )}
      </div>
    </li>
  );
};
