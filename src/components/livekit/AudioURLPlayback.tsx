import { useEffect, useRef, useCallback } from "react";
import { Track } from "livekit-client";
import { useLocalParticipant } from "@livekit/components-react";

type AudioURLPlaybackProps = { url: string | null };

export const AudioURLPlayback = ({ url }: AudioURLPlaybackProps) => {
  const audioElContainerRef = useRef<HTMLDivElement>();
  const audioElRef = useRef<HTMLAudioElement>();
  const audioSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioContextRef = useRef(new AudioContext());
  const audioDestinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const publishedTrack = useRef<MediaStreamTrack | null>(null);
  const { localParticipant } = useLocalParticipant();

  const cleanup = useCallback(() => {
    if (publishedTrack.current) {
      localParticipant.unpublishTrack(publishedTrack.current);
      publishedTrack.current = null;
    }
    if (audioSourceNodeRef.current) {
      audioSourceNodeRef.current.disconnect();
      audioSourceNodeRef.current = null;
    }
    if (audioDestinationNodeRef.current) {
      audioDestinationNodeRef.current.disconnect();
      audioDestinationNodeRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.remove();
      audioElRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!url) cleanup();

    // Create audio source and store it
    audioSourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElRef.current);

    // Connect audio source node to a MediaStreamAudioDestinationNode
    audioDestinationNodeRef.current = audioContextRef.current.createMediaStreamDestination();
    audioSourceNodeRef.current.connect(audioDestinationNodeRef.current);

    // Publish audio to LiveKit room
    publishedTrack.current = audioDestinationNodeRef.current.stream.getAudioTracks()[0];
    localParticipant.publishTrack(publishedTrack.current, {
      name: "audio_from_url",
      source: Track.Source.Unknown,
    });

    return cleanup();
  }, [cleanup]);

  return <audio ref={audioElRef} preload="auto" url={url} muted={false} autoPlay="true" />;
};
