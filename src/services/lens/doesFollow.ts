import { apiUrls } from "@/constants/apiUrls";
import request, { gql } from "graphql-request";

export const DOES_FOLLOW = gql`
  query DoesFollow($request: DoesFollowRequest!) {
    doesFollow(request: $request) {
      followerAddress
      profileId
      follows
    }
  }
`;

export default async (followInfos) => {
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
