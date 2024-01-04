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
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Icons,
} from "../ui";
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
          <ParticipantControls screenShareParticipant={screenShareParticipant} space={space} />
        </ParticipantLoop>
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
  space,
}: {
  screenShareParticipant: LocalParticipant | RemoteParticipant;
  space: any;
}) => {
  const { address } = useAccount();
  const participant = useParticipantContext();

  if (participant.name !== address) return null;
  if (!(participant.permissions?.canPublish || participant.name === space.creatorAddress)) return null;

  return (
    <>
      <CustomControls
        controls={{
          microphone: true,
          camera: true,
          screenShare: screenShareParticipant ? participant?.identity === screenShareParticipant?.identity : true,
        }}
        className="border-none gap-2 flex items-center z-30"
      />
      {/* TODO: handle ending stream gracefully */}
      {/* <EndStreamButton space={space} /> */}
    </>
  );
};

const EndStreamButton = ({ space }: { space: any }) => {
  const handleEndStream = async () => {
    try {
      const res = await fetch("/api/stream/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(space),
      });

      if (res.status === 200) {
        // window.location.reaload();
      }
    } catch (err) {
      console.error("failed to end stream", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="z-30 bg-background rounded-lg p-2 py-[0.62rem] hover:bg-foreground">
        <>
          <span className="sr-only">End stream</span>
          <Icons.endStream className="w-6 h-6" />
        </>
      </DialogTrigger>
      <DialogContent className="max-w-[90%] sm:max-w-lg border-none">
        <>
          <DialogHeader className="mb-4">
            <DialogTitle className="mb-4">This will end the stream</DialogTitle>
          </DialogHeader>
          <DialogDescription className="">
            <p>Are you sure you want to continue?</p>
            <Button onClick={handleEndStream}>End stream</Button>
          </DialogDescription>
        </>
      </DialogContent>
    </Dialog>
  );
};

const useIsHost = (metadata: string) => {
  const isHost = useMemo(() => {
    try {
      const parsed = JSON.parse(metadata);
      return parsed?.isHost;
    } catch (err) {
      console.log("failed to parse host metadata, setting to false");
      return false;
    }
  }, [metadata]);
  return isHost;
};
