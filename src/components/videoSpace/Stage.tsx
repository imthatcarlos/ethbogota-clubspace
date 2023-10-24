import { TrackContext, TrackLoop, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { ParticipantTile } from "./ParticipantTile";
import styles from "./videoSpace.module.css";
import { cn } from "@/lib/utils/cn";
import { useMemo } from "react";
import { ParticipantTileWithScreenShare } from "./ParticipantTileWithScreenShare";

export const Stage = () => {
  // const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: true });

  // @TODO: handle ui when screen share is active
  // const hasScreenShare = tracks.some((track) => track.source === Track.Source.ScreenShare);
  const screenShares = tracks.filter((track) => track.source === Track.Source.ScreenShare);
  const hasScreenShare = useMemo(() => screenShares.length > 0, [screenShares]);

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
    </>
    //  <GridLayout tracks={tracks}>
    //     <ParticipantTile />
    //     {/* {(track) => track && <VideoTrack {...track} />} */}
    //    </GridLayout>
  );
};
