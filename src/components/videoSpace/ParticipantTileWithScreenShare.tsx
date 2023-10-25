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

export const ParticipantTileWithScreenShare = ({
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

  if (trackRef.source === Track.Source.ScreenShare) {
    return (
      <div {...elementProps} className="z-0 absolute overflow-hidden max-w-full top-0 left-0">
        <ParticipantContextIfNeeded participant={trackRef.participant}>
          {children ?? (
            <VideoTrack
              participant={trackRef.participant}
              source={trackRef.source}
              publication={trackRef.publication}
              onSubscriptionStatusChanged={handleSubscribe}
              className="rounded-2xl"
            />
          )}
        </ParticipantContextIfNeeded>
      </div>
    );
  }

  return (
    <div {...elementProps} className="w-[20%] h-[20%] rounded-2xl z-10">
      <div className={cn("relative flex rounded-2xl flex-col gap-1 overflow-hidden h-full", styles.participantTile)}>
        <ParticipantContextIfNeeded participant={trackRef.participant}>
          {children ?? (
            <>
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
        </ParticipantContextIfNeeded>
        <FocusToggle trackSource={trackRef.source} />
      </div>
    </div>
  );
};

const DisplayName = ({ defaultProfile }: { defaultProfile: DefaultLensProfile }) => {
  if (defaultProfile?.handle) {
    return (
      <span className="text-white first-letter:uppercase text-xl font-bold select-none">{defaultProfile.handle}</span>
    );
  }
  return <ParticipantName />;
};
