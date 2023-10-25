import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { useParticipants, ParticipantLoop } from "@livekit/components-react";
import { Users } from "lucide-react";
import { ParticipantList } from "./ParticipantList";
import { useMemo } from "react";
import { DefaultLensProfile } from "@/types/lens";
import getLensPictureURL from "@/lib/utils/getLensPictureURL";
import useENS from "@/hooks/useENS";

export const ParticipantDialogList = () => {
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
  let participantsWithoutHost = participants.filter((p) => p.identity !== host?.identity);

  const address = host?.name;
  const { data: ensData } = useENS(address);
  const { defaultProfile }: { defaultProfile: DefaultLensProfile; isHost: boolean } = useMemo(() => {
    if (host?.metadata) {
      return JSON.parse(host?.metadata);
    }
    return { defaultProfile: undefined, isHost: false };
  }, [host?.metadata]);

  const avatar = useMemo(
    () => (defaultProfile?.picture ? getLensPictureURL(defaultProfile) : "/anon.png"),
    [defaultProfile]
  );

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

  return (
    <Dialog>
      <DialogTrigger className="z-30 bg-background rounded-lg p-2 py-[0.62rem] hover:bg-foreground">
        <Users size={24} className="ml-2 mr-2" />
      </DialogTrigger>
      <DialogContent className="max-w-[90%] sm:max-w-lg border-none">
        <DialogHeader className="mb-4">
          <DialogTitle className="mb-4">Stage</DialogTitle>
          <div className="flex gap-3">
            <img className="h-12 w-12 rounded-full" src={avatar} alt={`Avatar of user ${displayName}`} />

            <div className="font-bold truncate max-w-[15ch]">{displayName}</div>
          </div>
        </DialogHeader>
        <h2 className="text-3xl font-semibold">Invite to stage</h2>
        <DialogDescription className="space-y-6 max-h-60 overflow-auto">
          <ParticipantLoop participants={participantsWithoutHost}>
            <ParticipantList />
          </ParticipantLoop>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
