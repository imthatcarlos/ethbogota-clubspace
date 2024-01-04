import { useMutation } from "@tanstack/react-query";
import { useRoomInfo } from "@livekit/components-react";
import { type Participant } from "livekit-client";
import { Button } from "@/components/ui";
import toast from "react-hot-toast";

const MAX_STAGE_COUNT = 2;

export const HostSection = ({ participant, spaceExp, stageCount }: { participant: Participant, spaceExp: number, stageCount: number }) => {
  // const participant = useParticipantContext();
  const room = useRoomInfo();

  const { mutate: muteParticipant } = useMutation({
    mutationFn: async (participant: Participant) => {
      const promoting = !participant.permissions.canPublish;

      await fetch("/api/room/muteParticipant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: participant.name,
          roomName: room.name,
          canPublish: !participant.permissions.canPublish,
          spaceExp,
          identity: participant.identity,
        }),
      });

      toast.success(promoting ? 'Promoted to stage' : 'Removed from stage');
    }
  });

  const stageFull = stageCount === MAX_STAGE_COUNT;
  const buttonText = stageFull
    ? "Stage Full"
    : (participant.permissions?.canPublish ? "Kick 🚫" : "Invite 🎙");

  return (
    <>
      <Button disabled={stageFull} variant="white" size="md" onClick={() => muteParticipant(participant)}>
        {buttonText}
      </Button>
    </>
  );
};
