import { useState, useEffect } from "react";
import { Participant } from "livekit-client";
import { useParticipantContext } from "@livekit/components-react";
import { DefaultLensProfile } from "@/types/lens";
import getLensPictureURL from "@/lib/utils/getLensPictureURL";
import { shortAddress } from "@/utils";

export const useMetadataInfo = (participant: Participant) => {
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [displayName, setDisplayName] = useState<string | undefined>(undefined);
  const [handle, setHandle] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (participant) {
      try {
        const { metadata } = participant;
        const { defaultProfile, ensData }: { defaultProfile: DefaultLensProfile; ensData: any } = JSON.parse(metadata);

        setAvatar(defaultProfile?.metadata ? getLensPictureURL(defaultProfile) : "/anon.png");
        setDisplayName(defaultProfile?.metadata?.displayName ?? defaultProfile?.handle?.localName ?? ensData?.handle ?? shortAddress(participant.name));
        setHandle(defaultProfile?.handle?.localName ? `@${defaultProfile?.handle?.localName}` : '');
      } catch (err) {
        console.log("Failed to parse metadata");
      }
    }
  }, [participant]);

  return { avatar, displayName, handle };
}

export const ParticipantListItem = ({}: {}) => {
  const participant = useParticipantContext();
  const { displayName, avatar, handle } = useMetadataInfo(participant);

  return (
    <div className="flex gap-3">
      <img className="h-12 w-12 rounded-full" src={avatar} alt={`Avatar of user ${displayName}`} />

      <div className="flex flex-col">
        {handle && <div className="font-light truncate max-w-[15ch] text-gray-400 text-sm">{handle}</div>}
        <div className="font-bold truncate max-w-[15ch]">{displayName}</div>
      </div>
    </div>
  );
};
