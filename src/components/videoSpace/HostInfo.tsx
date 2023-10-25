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
  // const avatar = getPictureToDisplay(space.creatorAvatar);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-xs font-semibold whitespace-nowrap inline-flex gap-1">
        <img className="h-20 w-20 rounded-full select-none pointer-events-none" src={space.creatorAvatar} alt="avatar" />
        <div className="flex flex-col gap-4">
          <span className="font-light text-lg pl-4">{space.creatorLensHandle || space.handle}</span>
          {/* @TODO: how do I get the space name? And do we even have it */}
          <span className="font-bold text-xl pl-4">Testing MadFi Spaces</span>
        </div>
      </div>
      <div>{/** other info here */}</div>
    </div>
  );
};
