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
import { ReactNode, useCallback } from "react";
import styles from "./videoSpace.module.css";

export const ParticipantTile = ({
  participant,
  children,
  source = Track.Source.Camera,
  onParticipantClick,
  publication,
  disableSpeakingIndicator,
  ...htmlProps
}: ParticipantTileProps): ReactNode => {
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
    <div
      {...elementProps}
      className={cn("rounded-2xl flex flex-col gap-1 overflow-hidden relative", styles.participantTile)}
    >
      <ParticipantContextIfNeeded participant={trackRef.participant}>
        {children ?? (
          <>
            {trackRef.source === Track.Source.ScreenShare && (
              <div className="absolute top-0 left-0 p-1 z-0">
                <VideoTrack
                  participant={trackRef.participant}
                  source={trackRef.source}
                  publication={trackRef.publication}
                  onSubscriptionStatusChanged={handleSubscribe}
                  className="rounded-2xl"
                />
              </div>
            )}
            {trackRef.publication?.kind === "video" || trackRef.source === Track.Source.Camera ? (
              <VideoTrack
                participant={trackRef.participant}
                source={trackRef.source}
                publication={trackRef.publication}
                onSubscriptionStatusChanged={handleSubscribe}
                className="rounded-2xl w-full h-full"
              />
            ) : (
              <AudioTrack
                participant={trackRef.participant}
                source={trackRef.source}
                publication={trackRef.publication}
                onSubscriptionStatusChanged={handleSubscribe}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-foreground pointer-events-none rounded-2xl opacity-0">
              <img
                src={defaultProfile ? getUrlForImageFromIpfs(defaultProfile?.picture?.original?.url) : "/anon.png"}
                alt={defaultProfile ? defaultProfile?.handle : p.identity}
                className="rounded-full aspect-square w-32 h-32"
              />
            </div>
            <div className="absolute flex flex-row items-center justify-between gap-2 leading-none bottom-1 inset-x-1">
              <div className="flex items-center p-1">
                <TrackMutedIndicator source={Track.Source.Microphone} show={"muted"}></TrackMutedIndicator>
                <DisplayName defaultProfile={defaultProfile} />
              </div>
              {/* <ConnectionQualityIndicator className="lk-participant-metadata-item" /> */}
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
    return (
      <span className="text-white text-xl font-bold select-none">{defaultProfile.handle}</span>
    );
  }
  return <ParticipantName />;
};
