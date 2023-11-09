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
import { useAccount } from "wagmi";

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
        {tracks.length > 0 ? (
          <TrackLoop tracks={tracks}>
            <TrackContext.Consumer>
              {/* {(track) => track && <VideoTrack {...track} />} */}
              {(track) => (track && !hasScreenShare ? <ParticipantTile /> : <ParticipantTileWithScreenShare />)}
            </TrackContext.Consumer>
          </TrackLoop>
        ) : (
          <div className="flex items-center justify-center">
            <h1 className="text-4xl text-center">Nothing to see here...</h1>
          </div>
        )}
      </div>

      <div className="-mt-16 flex items-center justify-center z-30 flex-1 gap-2">
        <ParticipantLoop participants={participants}>
          <ParticipantControls screenShareParticipant={screenShareParticipant} creatorAddress={space.creatorAddress} />
        </ParticipantLoop>

        {/* <ParticipantDialogList /> */}
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
  creatorAddress,
}: {
  screenShareParticipant: LocalParticipant | RemoteParticipant;
  creatorAddress: string;
}) => {
  const { address } = useAccount();
  const participant = useParticipantContext();
  const permissions = participant.permissions;

  // const metadata = participant.metadata;
  // const metadataAddress = useMemo(() => {
  //   try {
  //     const parsed = JSON.parse(metadata);
  //     console.log("parsed", parsed);
  //     return parsed?.isHost;
  //   } catch (err) {
  //     console.log("failed to parse host metadata, setting to false");
  //     return false;
  //   }
  // }, [metadata]);

  // console.log(`User ${address} with canPublish = ${permissions?.canPublish}`);

  if (permissions && permissions.canPublish) {
    // && participant.identity === creatorAddress) {
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
