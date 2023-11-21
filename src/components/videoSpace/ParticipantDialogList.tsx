import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Icons } from "@/components/ui";
import { useParticipants, ParticipantLoop, useParticipantContext } from "@livekit/components-react";
import { ParticipantList } from "./ParticipantList";
import { useEffect, useMemo, useState } from "react";
import { DefaultLensProfile } from "@/types/lens";
import getLensPictureURL from "@/lib/utils/getLensPictureURL";
import { Participant } from "livekit-client";
import { useAccount } from "wagmi";
import Image from "next/image";

// @TODO: place it on a more reusable place
function useMetadataInfo(participant: Participant) {
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [displayName, setDisplayName] = useState<string | undefined>(undefined);
  const [handle, setHandle] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (participant) {
      try {
        const { metadata } = participant;
        const { defaultProfile, ensData }: { defaultProfile: DefaultLensProfile; ensData: any } = JSON.parse(metadata);

        setAvatar(defaultProfile?.metadata ? getLensPictureURL(defaultProfile) : "/anon.png");
        setDisplayName(defaultProfile?.metadata?.displayName ?? defaultProfile?.handle?.localName ?? ensData?.handle ?? participant.name);
        setHandle(defaultProfile?.handle?.localName ? `@${defaultProfile?.handle?.localName}` : '');
      } catch (err) {
        console.log("Failed to parse metadata");
      }
    }
  }, [participant]);

  return { avatar, displayName, handle };
}

export const ParticipantDialogList = () => {
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

  // filter out host from list to avoid fetching things on the ParticipantList
  let stageParticipants = participants.filter((p) => p.permissions?.canPublish);
  let regularParticipants = participants.filter((p) => !p.permissions?.canPublish);

  return (
    <Dialog>
      <DialogTrigger className="z-30 bg-background rounded-lg p-2 py-[0.62rem] hover:bg-foreground">
        <div className="flex flex-row gap-x-6">
          <div className="flex flex-row items-center">
            <Icons.eye className="m-1 mr-2 opacity-100 w-4 h-4" />
            <span>{participants.length}</span>
          </div>
          <ProfilePicList participants={participants.slice(0, 5)} />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[90%] sm:max-w-lg border-none">
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
              <ParticipantList />
            </ParticipantLoop>
          </DialogDescription>
        </>
      </DialogContent>
    </Dialog>
  );
};

const StageParticipant = () => {
  const participant = useParticipantContext();
  const { displayName, avatar, handle } = useMetadataInfo(participant);

  return (
    <div className="flex gap-3">
      <img className="h-12 w-12 rounded-full" src={avatar} alt={`Avatar of user ${displayName}`} />

      <div className="flex flex-col">
        {handle && <div className="font-light truncate max-w-[15ch] text-gray-400 text-sm">{handle}</div>}
        <div className="font-bold truncate max-w-[15ch]">{displayName}</div>
      </div>
    </div>
  );
};

const ProfilePic = ({ participant }: { participant: Participant }) => {
  const { avatar, displayName } = useMetadataInfo(participant);

  return (
    <img
      key={participant.sid}
      className="inline-block h-8 w-8 rounded-full ring-2 ring-foreground"
      src={avatar}
      alt={`profile of ${displayName}`}
      height={32}
      width={32}
    />
  );
};

const ProfilePicList = ({ participants }: { participants: Array<Participant> }) => {
  return (
    <div className="flex -space-x-1">
      {participants.map((participant, index) => (
        <div style={{ zIndex: participants.length - index }} className="relative">
          <ProfilePic participant={participant} key={participant.sid} />
        </div>
      ))}
    </div>
  );
};
