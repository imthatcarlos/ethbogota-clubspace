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

export const ParticipantDialogList = () => {
  const participants = useParticipants();

  return (
    <Dialog>
      <DialogTrigger>
        <Users size={24} className="ml-2 mr-2"/>
      </DialogTrigger>
      <DialogContent className="max-w-[90%] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="mb-4">Participants</DialogTitle>
          <DialogDescription className="space-y-4">
            <ParticipantLoop participants={participants}>
              <ParticipantList />
            </ParticipantLoop>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
