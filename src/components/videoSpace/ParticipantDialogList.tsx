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

export const ParticipantDialogList = ({ isHost }: { isHost: boolean }) => {
  const participants = useParticipants();

  return (
    <Dialog>
      <DialogTrigger>
        <Users size={32} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Participants listening</DialogTitle>
          <DialogDescription className="space-y-4">
            <ParticipantLoop participants={participants}>
              <ParticipantList isHost={isHost} />
            </ParticipantLoop>
            {/* <ParticipantLoop participants={participants}>
              <ParticipantList isHost={isHost} />
            </ParticipantLoop>
            <ParticipantLoop participants={participants}>
              <ParticipantList isHost={isHost} />
            </ParticipantLoop> */}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
