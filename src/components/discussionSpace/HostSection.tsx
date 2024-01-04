import { useMutation } from "@tanstack/react-query";
import { useRoomInfo } from "@livekit/components-react";
import { type Participant } from "livekit-client";
import { Button } from "@/components/ui";
import toast from "react-hot-toast";

export const HostSection = ({ participant, spaceExp }: { participant: Participant, spaceExp: number }) => {
  // const participant = useParticipantContext();
  const room = useRoomInfo();

  const participantPermissions = participant.permissions;

  const { mutate: muteParticipant } = useMutation({
    mutationFn: async (participant: Participant, promoting: boolean) => {
      await fetch("/api/room/muteParticipant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: participant.name,
          roomName: room.name,
          canPublish: !participant.permissions.canPublish,
          spaceExp
        }),
      });

      toast.success(promoting ? 'Promoted to stage' : 'Removed from stage');
    }
  });
  return (
    <>
      <Button variant="white" size="md" onClick={() => muteParticipant(participant, !participantPermissions?.canPublish)}>
        {participantPermissions?.canPublish ? "Kick 🚫" : "Invite 🎙"}
      </Button>
    </>
  );
};
