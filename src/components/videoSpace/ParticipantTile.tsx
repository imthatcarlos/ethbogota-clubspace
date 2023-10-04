import { cn } from "@/lib/utils/cn";
import { DefaultLensProfile } from "@/types/lens";
import { getUrlForImageFromIpfs } from "@/utils";
import { type TrackReferenceOrPlaceholder, isParticipantSourcePinned } from "@livekit/components-core";
import {
  AudioTrack,
  ConnectionQualityIndicator,
  FocusToggle,
  ParticipantContextIfNeeded,
  ParticipantName,
  ParticipantTileProps,
  TrackMutedIndicator,
  VideoTrack,
  useEnsureParticipant,
  useMaybeLayoutContext,
  useMaybeTrackContext,
  useParticipantTile,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { ScreenShareIcon } from "lucide-react";
import { useCallback } from "react";

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

export const ParticipantTile = ({
  participant,
  children,
  source = Track.Source.Camera,
  onParticipantClick,
  publication,
  disableSpeakingIndicator,
  ...htmlProps
}: ParticipantTileProps) => {
  const p = useEnsureParticipant(participant);
  const trackRef: TrackReferenceOrPlaceholder = useMaybeTrackContext() ?? {
    participant: p,
    source,
    publication,
  };

  const { metadata, sid } = p;

  const { defaultProfile, isHost }: { defaultProfile?: DefaultLensProfile; isHost: boolean } = JSON.parse(metadata);

  const { elementProps } = useParticipantTile<HTMLDivElement>({
    participant: trackRef.participant,
    htmlProps,
    source: trackRef.source,
    publication: trackRef.publication,
    disableSpeakingIndicator,
    onParticipantClick,
  });

  const layoutContext = useMaybeLayoutContext();

  const handleSubscribe = useCallback(
    (subscribed: boolean) => {
      if (
        trackRef.source &&
        !subscribed &&
        layoutContext &&
        layoutContext.pin.dispatch &&
        isParticipantSourcePinned(trackRef.participant, trackRef.source, layoutContext.pin.state)
      ) {
        layoutContext.pin.dispatch({ msg: "clear_pin" });
      }
    },
    [trackRef.participant, layoutContext, trackRef.source]
  );

  return (
    <div style={{ position: "relative" }} {...elementProps}>
      <ParticipantContextIfNeeded participant={trackRef.participant}>
        {children ?? (
          <>
            {trackRef.publication?.kind === "video" ||
            trackRef.source === Track.Source.Camera ||
            trackRef.source === Track.Source.ScreenShare ? (
              <VideoTrack
                participant={trackRef.participant}
                source={trackRef.source}
                publication={trackRef.publication}
                onSubscriptionStatusChanged={handleSubscribe}
              />
            ) : (
              <AudioTrack
                participant={trackRef.participant}
                source={trackRef.source}
                publication={trackRef.publication}
                onSubscriptionStatusChanged={handleSubscribe}
              />
            )}
            <div className="lk-participant-placeholder">
              <img
                src={defaultProfile ? getUrlForImageFromIpfs(defaultProfile?.picture?.original?.url) : "/anon.png"}
                alt={defaultProfile ? defaultProfile?.handle : p.identity}
                className="rounded-full aspect-square w-32 h-32"
              />
            </div>
            <div className="lk-participant-metadata">
              <div className="lk-participant-metadata-item">
                <TrackMutedIndicator source={Track.Source.Microphone} show={"muted"}></TrackMutedIndicator>
                <DisplayName defaultProfile={defaultProfile} />
              </div>
              <ConnectionQualityIndicator className="lk-participant-metadata-item" />
            </div>
          </>
        )}
        <FocusToggle trackSource={trackRef.source} />
      </ParticipantContextIfNeeded>
    </div>
  );
};

const DisplayName = ({ defaultProfile }: { defaultProfile: DefaultLensProfile }) => {
  if (defaultProfile?.handle) {
    return <span className="data-lk-participant-name">{defaultProfile.handle}</span>;
  }
  return <ParticipantName />;
};
