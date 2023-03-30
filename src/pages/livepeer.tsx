import { useCreateStream } from "@livepeer/react";

const streamName = `kseikyo.lens`;

export default function SomeComponent() {
  const { mutate: createStream, data: stream, status } = useCreateStream({ name: streamName });

  // save stream.playbackId, stream.streamKey, stream.rtmpIngestUrl to db related to user handle

  return (
    <div>
      <button disabled={status === "loading" || !createStream} onClick={() => createStream?.()}>
        Create Stream
      </button>
      <p>
        OLD: Stream Key: 4d60-cuxw-9pne-l0ri | Stream rtmpIngestUrl: rtmp://rtmp.livepeer.com/live/4d60-cuxw-9pne-l0ri
      </p>
      {stream && (
        <div>
          Stream Key: {stream.streamKey} | Stream rtmpIngestUrl: {stream.rtmpIngestUrl}
        </div>
      )}
    </div>
  );
}
