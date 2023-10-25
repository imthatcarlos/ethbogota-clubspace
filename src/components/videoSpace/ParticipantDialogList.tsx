import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { useParticipants, ParticipantLoop, useParticipantContext } from "@livekit/components-react";
import { Users } from "lucide-react";
import { ParticipantList } from "./ParticipantList";
import { useEffect, useMemo, useState } from "react";
import { DefaultLensProfile } from "@/types/lens";
import getLensPictureURL from "@/lib/utils/getLensPictureURL";
import { Participant } from "livekit-client";
import { Button } from "../ui";
import { useAccount } from "wagmi";

// @TODO: place it on a more reusable place
function useMetadataInfo(participant: Participant) {
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [displayName, setDisplayName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (participant) {
      try {
        const { metadata } = participant;
        const { defaultProfile, ensData }: { defaultProfile: DefaultLensProfile; ensData: any } = JSON.parse(metadata);

        setAvatar(defaultProfile?.picture ? getLensPictureURL(defaultProfile) : "/anon.png");
        setDisplayName(defaultProfile?.handle ?? ensData?.handle ?? participant.name);
      } catch (err) {
        console.log("Failed to parse metadata");
      }
    }
  }, [participant]);

  return { avatar, displayName };
}

export const ParticipantDialogList = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [callbackAction, setCallbackAction] = useState<(args?: any) => void>(undefined);
  const [callbackArgs, setCallbackArgs] = useState<Participant | undefined>(undefined);

  const { address: userAddress } = useAccount();
  const participants = useParticipants();

  const host = useMemo(
    () =>
      participants.find((p) => {
        if (!p.metadata) return false;
        try {
          const { isHost } = JSON.parse(p.metadata);
          return isHost;
        } catch (err) {
          return false;
        }
      }),
    [participants]
  );

  const participantFromAction = useMetadataInfo(callbackArgs);

  // filter out host from list to avoid fetching things on the ParticipantList
  let stageParticipants = participants.filter((p) => p.permissions?.canPublish);
  let regularParticipants = participants.filter((p) => !p.permissions?.canPublish);

  const handlePromotionConfirmation = (callback?: () => void, args?: any) => {
    setCallbackAction(callback);
    setCallbackArgs(args);
    setShowConfirmation(true);
  };

  return (
    <Dialog>
      <DialogTrigger className="z-30 bg-background rounded-lg p-2 py-[0.62rem] hover:bg-foreground">
        <Users size={24} className="ml-2 mr-2" />
      </DialogTrigger>
      <DialogContent className="max-w-[90%] sm:max-w-lg border-none">
        {!showConfirmation && (
          <>
            <DialogHeader className="mb-4">
              <DialogTitle className="mb-4">{stageParticipants.length > 0 ? "Stage" : "Stage is empty"}</DialogTitle>
              {stageParticipants.length > 0 ? (
                <ParticipantLoop participants={stageParticipants}>
                  <StageParticipant />
                </ParticipantLoop>
              ) : null}
            </DialogHeader>
            <h2 className="text-3xl font-semibold">
              {host?.identity === userAddress ? "Invite to stage" : "Online now"}
            </h2>
            <DialogDescription className="space-y-6 max-h-60 overflow-auto">
              <ParticipantLoop participants={regularParticipants}>
                <ParticipantList handlePromotionConfirmation={handlePromotionConfirmation} />
              </ParticipantLoop>
            </DialogDescription>
          </>
        )}
        {showConfirmation && (
          <>
            <DialogHeader className="mb-4 max-w-[75%]">
              <DialogTitle className="mb-4 text-3xl">Are you sure you want to invite/mute the participant?</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              {participantFromAction && (
                <>
                  <img
                    className="h-12 w-12 rounded-full"
                    src={participantFromAction.avatar}
                    alt={`Avatar of user ${participantFromAction.displayName}`}
                  />
                  <div className="font-bold truncate max-w-[15ch]">{participantFromAction.displayName}</div>
                </>
              )}
            </div>
            <div className="flex items-center justify-end gap-4">
              <Button onClick={() => callbackAction(callbackArgs)}>Yes</Button>
              <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
                No
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const StageParticipant = () => {
  const participant = useParticipantContext();
  const { displayName, avatar } = useMetadataInfo(participant);

  return (
    <div className="flex gap-3">
      <img className="h-12 w-12 rounded-full" src={avatar} alt={`Avatar of user ${displayName}`} />

      <div className="font-bold truncate max-w-[15ch]">{displayName}</div>
    </div>
  );
};
