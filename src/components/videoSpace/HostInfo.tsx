import React, { useMemo, memo } from "react";
import Image from "next/image";
import { useParticipantContext } from "@livekit/components-react";
import { ParticipantDialogList } from "./ParticipantDialogList";

export function getPictureToDisplay(picture: any) {
  if (picture) {
    if (picture && picture.__typename === "NftImage") {
      return picture.uri || null;
    } else {
      return picture.original ? picture.original.url : null;
    }
  } else {
    return null;
  }
}

export const HostInfo = ({ space }: { space: any }) => {
  return (
    <div className="flex items-center justify-between gap-2 pt-4">
      <div className="text-xs font-semibold whitespace-nowrap inline-flex gap-1">
        <img
          className="h-20 w-20 rounded-full select-none pointer-events-none"
          src={space.creatorAvatar}
          alt="avatar"
        />
        <div className="flex flex-col gap-2">
          <span className="font-light text-lg pl-4">@{space.creatorLensHandle || space.handle}</span>
          <span className="font-bold text-xl pl-4">{space.roomName || 'Livestream on MadFi'}</span>
        </div>
      </div>
      <div>
        <ParticipantDialogList creatorAddress={space.creatorAddress} space={space} />
      </div>
    </div>
  );
};
