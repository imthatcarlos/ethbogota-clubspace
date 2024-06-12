import request, { gql } from "graphql-request";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { apiUrls } from "@/constants/apiUrls";

const DOES_FOLLOW = gql`
  query DoesFollow($request: DoesFollowRequest!) {
    doesFollow(request: $request) {
      followerAddress
      profileId
      follows
    }
  }
`;

export const doesFollow = async (followInfos) => {
  try {
    return await request({
      url: apiUrls.lensAPI,
      document: DOES_FOLLOW,
      variables: { request: { followInfos } },
    });
  } catch (error) {
    console.log(error);
  }
};

export const useDoesFollow = (options = {}, { followerAddress, profileId }, cacheKey: string = 'useDoesFollow') => {
  return useQuery({
    queryKey: [cacheKey, `${followerAddress},${profileId}`],
    queryFn: async () => {
      const { doesFollow: doesFollowData } = await doesFollow([{ followerAddress, profileId }]);
      return doesFollowData[0].follows;
    },
    enabled: !!(followerAddress && profileId),
    ...(options as any),
  });
};