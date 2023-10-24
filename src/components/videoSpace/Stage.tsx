import { TrackContext, TrackLoop, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { ParticipantTile } from "./ParticipantTile";
import styles from "./videoSpace.module.css";
import { cn } from "@/lib/utils/cn";

export const Stage = () => {
  // const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: true });

  // @TODO: handle ui when screen share is active
  // const hasScreenShare = tracks.some((track) => track.source === Track.Source.ScreenShare);

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 gap-6 relative p-4 bg-foreground rounded-2xl min-h-[calc(50vh-4rem)]",
          styles.stage
        )}
      >
        <TrackLoop tracks={tracks}>
          <TrackContext.Consumer>
            {/* {(track) => track && <VideoTrack {...track} />} */}
            {(track) => track && <ParticipantTile />}
          </TrackContext.Consumer>
        </TrackLoop>
      </div>
    </>
    //  <GridLayout tracks={tracks}>
    //     <ParticipantTile />
    //     {/* {(track) => track && <VideoTrack {...track} />} */}
    //    </GridLayout>
  );
};
