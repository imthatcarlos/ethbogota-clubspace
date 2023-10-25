import { useMemo } from "react";
import useENS from "@/hooks/useENS";
import { useParticipantContext, useRoomInfo } from "@livekit/components-react";
import { useMutation } from "@tanstack/react-query";
import { Participant } from "livekit-client";
import { DefaultLensProfile } from "@/types/lens";
import getLensPictureURL from "@/lib/utils/getLensPictureURL";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const ParticipantList = ({
  handlePromotionConfirmation,
}: {
  handlePromotionConfirmation: (callback?: any, args?: any) => void;
}) => {
  const participant = useParticipantContext();
  const [canPromoteParticipant, setCanPromoteParticipant] = useLocalStorage("canPromoteParticipant", true);
  const { defaultProfile, isHost }: { defaultProfile: DefaultLensProfile; isHost: boolean } = useMemo(
    () => JSON.parse(participant.metadata ?? "{}"),
    [participant]
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
      return defaultProfile?.picture ? getLensPictureURL(defaultProfile) : "/anon.png";
    }
    if (ensData && Object.keys(ensData) && ensData?.avatar) {
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
          canPublish: participant.permissions?.canPublish,
        }),
      });
    },
  });

  const handlePromoteParticipant = (participant: Participant) => {
    muteParticipant(participant);
    setCanPromoteParticipant(!canPromoteParticipant);
  };

  // @TODO: add loading state?
  return (
    <li className="flex items-start justify-between w-full">
      <div className="flex gap-3 flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="h-12 w-12 rounded-full" src={avatar} alt={`Avatar of user ${displayName}`} />
        <div className="font-bold truncate max-w-[15ch] text-base">
          {/* just in case we stringify it */}
          {displayName ? displayName : JSON.stringify(displayName)}
        </div>
      </div>

      <div className="justify-self-end flex flex-col items-center">
        {isHost && ( // && participant.name !== address && !participantPermissions?.canPublish && canPromoteParticipant && (
          <button
            className="w-fit rounded-full px-5 py-2 bg-almost-black text-white"
            onClick={() => handlePromotionConfirmation(handlePromoteParticipant, participant)}
          >
            Promote 🎙
          </button>
        )}
        {isHost && ( // && participant.name !== address && !canPromoteParticipant && participantPermissions?.canPublish && (
          <button
            className="w-fit rounded-full px-5 py-2 bg-almost-black text-white"
            onClick={() => handlePromotionConfirmation(handlePromoteParticipant, participant)}
          >
            🚫 Mute
          </button>
        )}
      </div>
    </li>
  );
};
