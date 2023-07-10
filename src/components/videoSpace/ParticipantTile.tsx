import { cn } from "@/lib/utils/cn";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { VideoTrack } from "@livekit/components-react";

export const CustomParticipantTile = ({ isHost, track }: { isHost: boolean; track: TrackReferenceOrPlaceholder }) => {
  return (
    <section
      className={cn("relative min-w-0 bg-red-800 p-1 rounded w-fit h-fit col-start-2", {
        "col-span-full place-self-center col-start-1": isHost,
      })}
      title={track.participant.name}
    >
      {/* <span className="absolute top-0 left-0">{isHost && "host"}</span> */}
      {isHost ? (
        <div className="w-full h-full rounded">
          <VideoTrack {...track} />
          {/* <span className="absolute bottom-0 right-0">promote</span> */}
        </div>
      ) : (
        <div className="w-32 h-32 rounded">
          <VideoTrack {...track} className="rounded" />
          {/* <span className="absolute bottom-0 right-0">promote</span> */}
        </div>
      )}
      {/* <span className="absolute bottom-0 left-0">mute</span> */}
    </section>
  );
};

export const MockedCustomParticipantTile = ({ isHost }: { isHost: boolean }) => {
  return (
    <section
      className={cn("relative min-w-0 bg-red-800 p-1 rounded w-fit h-fit", {
        "col-span-full place-self-center": isHost,
      })}
    >
      {isHost ? (
        <div className="w-full min-w-[60dvw] h-full min-h-[60dvh] rounded bg-black"></div>
      ) : (
        <div className="w-32 h-32 rounded bg-black"></div>
      )}
    </section>
  );
};
