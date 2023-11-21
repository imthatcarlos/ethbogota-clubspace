import { useMemo } from "react";
import useENS from "@/hooks/useENS";
import { useParticipantContext } from "@livekit/components-react";
import { DefaultLensProfile } from "@/types/lens";
import getLensPictureURL from "@/lib/utils/getLensPictureURL";

export const ParticipantList = ({}: {}) => {
  const participant = useParticipantContext();
  const { defaultProfile, isHost }: { defaultProfile: DefaultLensProfile; isHost: boolean } = useMemo(
    () => JSON.parse(participant.metadata ?? "{}"),
    [participant]
  );

  // when setting up metadata, we add address as identity
  // but this could be a generated name
  const address = participant.name;
  const { data: ensData } = useENS(address);

  const displayName = useMemo(() => {
    if (defaultProfile) {
      return defaultProfile?.metadata?.displayName || `@${defaultProfile?.handle.localName}`;
    }
    if (ensData && Object.keys(ensData) && ensData?.handle) {
      return ensData.handle;
    }
    return address;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, ensData, defaultProfile]);

  const avatar = useMemo(() => {
    if (defaultProfile) {
      return defaultProfile?.picture ? getLensPictureURL(defaultProfile) : "/anon.png";
    }
    if (ensData && Object.keys(ensData) && ensData?.avatar) {
      return ensData.avatar ?? "/anon.png";
    }
    return "/anon.png";
    // return `https://api.dicebear.com/5.x/open-peeps/svg?seed=${address}&size=32&face=smile,cute`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, ensData, defaultProfile]);

  // @TODO: add loading state?
  return (
    <li className="flex items-start justify-between w-full">
      <div className="flex gap-3 flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="h-12 w-12 rounded-full" src={avatar} alt={`Avatar of user ${displayName}`} />
        <div className="font-bold truncate max-w-[15ch] text-base">
          {/* just in case we stringify it */}
          {displayName ? displayName : JSON.stringify(displayName)}
        </div>
      </div>
    </li>
  );
};
