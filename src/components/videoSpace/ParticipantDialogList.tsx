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
import { useEffect, useMemo, useState } from "react";
import { DefaultLensProfile } from "@/types/lens";
import getLensPictureURL from "@/lib/utils/getLensPictureURL";
import useENS from "@/hooks/useENS";
import { LocalParticipant, Participant, RemoteParticipant } from "livekit-client";
import { Button } from "../ui";
import { useGetProfilesOwned } from "@/services/lens/getProfile";

function useHostInfo(address: string, host: RemoteParticipant | LocalParticipant) {
  const { data: ensData } = useENS(address);
  const { defaultProfile }: { defaultProfile: DefaultLensProfile; isHost: boolean } = useMemo(() => {
    if (host?.metadata) {
      return JSON.parse(host?.metadata);
    }
    return { defaultProfile: undefined, isHost: false };
  }, [host?.metadata]);

  const avatar: string = useMemo(
    () => (defaultProfile?.picture ? getLensPictureURL(defaultProfile) : "/anon.png"),
    [defaultProfile]
  );

  const displayName: string = useMemo(() => {
    if (defaultProfile) {
      return defaultProfile.handle;
    }
    if (ensData && Object.keys(ensData) && ensData?.handle) {
      return ensData.handle;
    }
    return address;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, ensData, defaultProfile]);

  return { displayName, avatar };
}

// @TODO: move this to a place and reuse whenever
function useAvatarAndDisplayName(address: string) {
  console.log("address", address);
  const { data: ensData } = useENS(address);
  const { data: profilesResponse, isLoading: isLoadingProfiles } = useGetProfilesOwned({}, address);

  const [defaultProfile, setDefaultProfile] = useState<{ id: string; picture: string; handle: string } | null>(null);

  const avatar: string = useMemo(
    () => (defaultProfile?.picture ? getLensPictureURL(defaultProfile) : "/anon.png"),
    [defaultProfile]
  );

  const displayName: string = useMemo(() => {
    if (defaultProfile) {
      return defaultProfile?.handle;
    }
    if (ensData && Object.keys(ensData) && ensData?.handle) {
      return ensData.handle;
    }
    return address;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, ensData, defaultProfile]);

  useEffect(() => {
    if (!isLoadingProfiles) {
      // @ts-ignore
      const _defaultProfile = profilesResponse ? profilesResponse?.defaultProfile : null;
      if (_defaultProfile) {
        setDefaultProfile({
          id: _defaultProfile?.id,
          picture: _defaultProfile.picture,
          handle: _defaultProfile.handle,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isLoadingProfiles]);

  return { avatar, displayName };
}

export const ParticipantDialogList = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [callbackAction, setCallbackAction] = useState<(args?: any) => void>(undefined);
  const [callbackArgs, setCallbackArgs] = useState<Participant | undefined>(undefined);

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

  const address = host?.name;
  const { displayName, avatar } = useHostInfo(address, host);
  const participantFromAction = useAvatarAndDisplayName(callbackArgs.name);

  // filter out host from list to avoid fetching things on the ParticipantList
  let participantsWithoutHost = participants.filter((p) => p.identity !== host?.identity);

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
              <DialogTitle className="mb-4">Stage</DialogTitle>
              <div className="flex gap-3">
                <img className="h-12 w-12 rounded-full" src={avatar} alt={`Avatar of user ${displayName}`} />

                <div className="font-bold truncate max-w-[15ch]">{displayName}</div>
              </div>
            </DialogHeader>
            <h2 className="text-3xl font-semibold">Invite to stage</h2>
            <DialogDescription className="space-y-6 max-h-60 overflow-auto">
              <ParticipantLoop participants={participantsWithoutHost}>
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
              <Button onClick={() => callbackAction(callbackArgs)}>
                Yes
              </Button>
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
