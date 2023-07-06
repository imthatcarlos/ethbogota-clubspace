import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { VideoTrack } from "@livekit/components-react";

export const CustomParticipantTile = ({ isHost, track }: { isHost: boolean; track: TrackReferenceOrPlaceholder }) => {
  return (
    <section className="relative min-w-0 bg-zinc-600 p-4 rounded w-fit h-fit" title={track.participant.name}>
      <span className="absolute top-0 left-0">{isHost && "host"}</span>
      <div className="w-32 h-32 rounded">
        <VideoTrack {...track} />
        {/* <span className="absolute bottom-0 right-0">promote</span> */}
      </div>
      <span className="absolute bottom-0 left-0">mute</span>
    </section>
  );
};
