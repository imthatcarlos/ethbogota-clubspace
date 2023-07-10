import { useMemo } from "react";
import useENS from "@/hooks/useENS";
import { useGetProfilesOwned } from "@/services/lens/getProfile";
import { useParticipantContext, useRoomInfo } from "@livekit/components-react";
import { useMutation } from "@tanstack/react-query";
import { Participant } from "livekit-client";

export const ParticipantList = ({ isHost }: { isHost: boolean }) => {
  const participant = useParticipantContext();
  const participantPermissions = participant.permissions;

  // when setting up metadata, we add address as identity
  const address = participant.name;
  const { data: ensData } = useENS(address);
  const { data: profilesResponse } = useGetProfilesOwned({}, address);
  const room = useRoomInfo();

  const displayName = useMemo(() => {
    // @ts-ignore
    if (profilesResponse && profilesResponse?.defaultProfile) {
      // @ts-ignore
      return profilesResponse?.defaultProfile;
    }
    if (ensData && Object.keys(ensData) && ensData?.handle) {
      return ensData.handle;
    }
    return address;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, ensData, profilesResponse]);

  const avatar = useMemo(() => {
    if (
      profilesResponse &&
      // @ts-ignore
      profilesResponse?.defaultProfile &&
      // @ts-ignore
      profilesResponse?.defaultProfile?.picture?.original?.url
    ) {
      // @ts-ignore
      return profilesResponse?.defaultProfile?.picture?.original?.url;
    }
    if (Object.keys(ensData) && ensData?.avatar) {
      return ensData.avatar;
    }
    return `https://api.dicebear.com/5.x/open-peeps/svg?seed=${address}&size=32&face=smile,cute`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, ensData, profilesResponse]);

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
              {displayName?.["handle"] ? displayName["handle"] : JSON.stringify(displayName)}
            </div>
          </div>
          {isHost && <div className="text-sm">Host</div>}
          {/* <div className="text-sm opacity-80">Promote speaker</div> */}
        </div>
      </div>

      <div className="justify-self-end flex flex-col items-center">
        {isHost && (
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
