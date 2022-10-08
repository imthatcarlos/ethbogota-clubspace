import { Profile } from "@/services/lens/getProfile";
import { FC } from "react";

type Props = {
  profile: Profile;
};

export const LensProfile: FC<Props> = ({ profile }) => {
  return (
    <div className="flex items-center justify-center flex-col max-w-[80px]">
      <img src={profile.picture.original.url} alt={profile?.id} className="rounded-full w-12 h-12 aspect-square" />
      {/* <p className="text-xs truncate">{profile.name || profile.handle}</p> */}
    </div>
  );
};
