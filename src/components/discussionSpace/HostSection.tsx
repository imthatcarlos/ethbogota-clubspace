import { useMutation } from "@tanstack/react-query";
import { useRoomInfo } from "@livekit/components-react";
import { type Participant } from "livekit-client";

export const HostSection = ({ participant}: {participant: Participant}) => {
  // const participant = useParticipantContext();
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
