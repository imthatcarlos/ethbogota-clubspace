import {
  ParticipantLoop,
  TrackContext,
  TrackLoop,
  useParticipantContext,
  useParticipants,
  useTracks,
} from "@livekit/components-react";
import { LocalParticipant, RemoteParticipant, Track } from "livekit-client";
import { ParticipantTile } from "./ParticipantTile";
import styles from "./videoSpace.module.css";
import { cn } from "@/lib/utils/cn";
import { useMemo } from "react";
import { ParticipantTileWithScreenShare } from "./ParticipantTileWithScreenShare";
import { CustomControls } from "./CustomControls";
import { ParticipantDialogList } from "./ParticipantDialogList";
import { PinnedPromotionDialog } from "./PinnedPromotionDialog";

export const Stage = ({ space }: { space: any }) => {
  // const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: true });

  const participants = useParticipants();
  const screenShareParticipant = useMemo(() => {
    return participants.find((p) => {
      return tracks.some((track) => track.source === Track.Source.ScreenShare);
    });
  }, [participants, tracks]);
  const hasScreenShare = screenShareParticipant !== undefined;

  return (
    <>
      <div
        className={cn(
          "h-[50.2vh] w-[61vw] 2xl:h-[65vh] 2xl:w-[65vw] relative bg-foreground p-4 rounded-2xl",
          { "grid grid-cols-2 gap-6": !hasScreenShare },
          { "flex items-end justify-end flex-col gap-4 overflow-hidden": hasScreenShare },
          !hasScreenShare && styles.stage
        )}
      >
        <TrackLoop tracks={tracks}>
          <TrackContext.Consumer>
            {/* {(track) => track && <VideoTrack {...track} />} */}
            {(track) => (track && !hasScreenShare ? <ParticipantTile /> : <ParticipantTileWithScreenShare />)}
          </TrackContext.Consumer>
        </TrackLoop>
      </div>

      <div className="-mt-16 flex items-center justify-center z-30 flex-1 gap-2">
        <ParticipantLoop participants={participants}>
          <ParticipantControls screenShareParticipant={screenShareParticipant} />
        </ParticipantLoop>

        <ParticipantDialogList />
        <PinnedPromotionDialog space={space} />
      </div>
    </>
    //  <GridLayout tracks={tracks}>
    //     <ParticipantTile />
    //     {/* {(track) => track && <VideoTrack {...track} />} */}
    //    </GridLayout>
  );
};

const ParticipantControls = ({
  screenShareParticipant,
}: {
  screenShareParticipant: LocalParticipant | RemoteParticipant;
}) => {
  const participant = useParticipantContext();
  const permissions = participant.permissions;

  if (permissions && permissions.canPublish) {
    return (
      <CustomControls
        controls={{
          microphone: true,
          camera: true,
          screenShare: screenShareParticipant ? participant?.identity === screenShareParticipant?.identity : true,
        }}
        className="border-none gap-2 flex items-center z-30"
      />
    );
  }
  return null;
};
