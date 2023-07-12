import { TrackContext, TrackLoop, useTracks, GridLayout } from "@livekit/components-react";
import { Track } from "livekit-client";
import { ParticipantTile } from "./ParticipantTile";

export const Stage = ({ isHost }: { isHost: boolean }) => {
  // const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

  return (
    <GridLayout tracks={tracks}>
      <TrackContext.Consumer>
        {/* {(track) => track && <VideoTrack {...track} />} */}
        {(track) => track && <ParticipantTile {...track} key={track.participant.sid} />}
      </TrackContext.Consumer>
    </GridLayout>
  );
};

// export const MockedStage = ({ isHost }: { isHost: boolean }) => {
//   const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
//   return (
//     <div className="grid grid-cols-8 gap-6 grid-rows-[auto] w-full h-full justify-center py-8">
//       <TrackLoop tracks={tracks}>
//         <TrackContext.Consumer>
//           {/* {(track) => track && <VideoTrack {...track} />} */}
//           {(track) => track && <CustomParticipantTile isHost={isHost} track={track} key={track.participant.sid} />}
//         </TrackContext.Consumer>
//       </TrackLoop>
//     </div>
//   );
// };
