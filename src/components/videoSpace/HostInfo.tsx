import useENS from "@/hooks/useENS";
import getLensPictureURL from "@/lib/utils/getLensPictureURL";
import { useGetProfilesOwned } from "@/services/lens/getProfile";
import { useEffect, useMemo, useState } from "react";

const USE_V1_PROFILE = true;

// @TODO: move this to a place and reuse whenever
function useAvatarAndDisplayName(address: string) {
  const { data: ensData } = useENS(address);
  const { data: profilesResponse, isLoading: isLoadingProfiles } = useGetProfilesOwned({}, address, USE_V1_PROFILE);

  const [defaultProfile, setDefaultProfile] = useState<{ id: string; picture: string; handle: string } | null>(null);

  const avatar: string = useMemo(
    () => (defaultProfile?.picture ? getLensPictureURL(defaultProfile) : "/anon.png"),
    [defaultProfile]
  );

  const displayName: string = useMemo(() => {
    if (defaultProfile) {
      return defaultProfile?.handle;
    }
    if (ensData && Object.keys(ensData) && ensData?.handle) {
      return ensData.handle;
    }
    return address;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, ensData, defaultProfile]);

  useEffect(() => {
    if (!isLoadingProfiles) {
      // @ts-ignore
      const _defaultProfile = profilesResponse ? profilesResponse?.defaultProfile : null;
      if (_defaultProfile) {
        setDefaultProfile({
          id: _defaultProfile?.id,
          picture: _defaultProfile.picture,
          handle: _defaultProfile.handle,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isLoadingProfiles]);

  return { avatar, displayName };
}

export const HostInfo = ({ space }: { space: any }) => {
  const address = space.creatorAddress;

  const { avatar, displayName } = useAvatarAndDisplayName(address);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-xs font-semibold whitespace-nowrap inline-flex gap-1">
        <img className="h-20 w-20 rounded-full select-none pointer-events-none" src={avatar} alt="avatar" />
        <div className="flex flex-col gap-4">
          <span className="font-light text-lg pl-4">{displayName}</span>
          {/* @TODO: how do I get the space name? And do we even have it */}
          <span className="font-bold text-xl pl-4">Testing MadFi Spaces</span>
        </div>
      </div>
      <div>
        {/** other info here */}
      </div>
    </div>
  );
};
