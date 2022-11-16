import React from "react";
import { Profile } from "@/services/lens/getProfile";
import { getUrlForImageFromIpfs } from "@/utils/ipfs";
import { useLensLogin, useLensRefresh } from "@/hooks/useLensLogin";

interface HostProps {
  profile: Profile;
  drawerProfileId: string;
  doesFollowDrawerProfile: boolean;
  onFollowClick: (drawerProfileId: string) => void;
  isHost: boolean;
}

export const HostCard = ({ profile, drawerProfileId, doesFollowDrawerProfile, onFollowClick, isHost }: HostProps) => {
  const { data: lensRefreshData } = useLensRefresh();
  const { data: lensLoginData } = useLensLogin();

  return (
    <>
      <div>
        <h2 className="my-4 text-4xl font-bold tracking-tight sm:text-2xl md:text-5xl drop-shadow-sm text-center">
          ClubSpace Host
        </h2>
        <div className="flex w-full justify-center">
          <div className="max-w-[20rem] min-w-[17rem]">
            <div className="bg-slate-800 shadow-xl rounded-lg">
              <div className="photo-wrapper p-2 pt-0 relative">
                <img
                  className="absolute t-0 left-0 right-0 w-full h-full object-cover"
                  src={profile.coverPicture?.original?.url || "/default-cover.jpg"}
                  alt=""
                />
                <img
                  className="w-16 h-16 rounded-full mx-auto relative top-10 outline outline-offset-0 outline-1 outline-gray-50"
                  src={profile.picture?.original?.url || ""}
                  alt={profile.handle}
                />
              </div>
              <div className="p-2 pt-10">
                <h3 className="text-center text-xl text-gray-900 dark:text-gray-300 font-medium leading-8 -mb-2">
                  @{profile.handle}
                </h3>
                <div className="text-center text-gray-400 text-md font-semibold mb-1">
                  <p>{profile.id}</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-white mb-0 p-4 text-center">
                  {profile.bio || <em>No bio provided.</em>}
                </p>

                <div className="flex justify-center mb-8 text-sm gap-x-4">
                  <div className="flex gap-x-2">
                    <span>
                      <strong>{profile.stats.totalFollowers}</strong>
                    </span>
                    <span className="dark:text-gray-400">
                      {profile.stats.totalFollowers === 1 ? "follower" : "followers"}
                    </span>
                  </div>

                  <div className="flex gap-x-2">
                    <span>
                      <strong>{profile.stats.totalFollowing}</strong>
                    </span>
                    <span className="dark:text-gray-400">following</span>
                  </div>
                </div>

                {
                  !isHost && (lensLoginData || lensRefreshData)
                    ? <div className="text-center my-3 px-3">
                        <button
                          className="!w-full btn"
                          onClick={() => {
                            onFollowClick(drawerProfileId, false);
                          }}
                          disabled={doesFollowDrawerProfile}
                        >
                          {doesFollowDrawerProfile ? "Following" : "Follow"}
                        </button>
                      </div>
                    : null
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
