import { TrackContext, TrackLoop, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { CustomParticipantTile } from "./ParticipantTile";

export const Stage = ({ isHost }: { isHost: boolean }) => {
  // const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

  // console.log("tracks", tracks);

  return (
    <div>
      <div className="grid grid-cols-8 gap-6 grid-rows-[auto] w-full h-full justify-center">
        <TrackLoop tracks={tracks}>
          <TrackContext.Consumer>
            {/* {(track) => track && <VideoTrack {...track} />} */}
            {(track) => track && <CustomParticipantTile isHost={isHost} track={track} key={track.participant.sid} />}
          </TrackContext.Consumer>
        </TrackLoop>
      </div>
    </div>
  );
};
