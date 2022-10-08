import { apiUrls } from "@/constants/apiUrls";
import { useQuery } from "@tanstack/react-query";
import { BigNumber } from "ethers";
import request, { gql } from "graphql-request";

export type Profile = {
  id: string;
  name: string | null;
  bio: string | null;
  metadata: string | null;
  isDefault: boolean;
  picture: {
    original: {
      url: string;
    };
  };
  handle: string;
  coverPicture: string | null;
  ownedBy: string;
  stats: {
    totalFollowers: number;
    totalFollowing: number;
  };
  followModule: string | null;
};

const GET_PROFILE_BY_HANDLE = gql`
  query ($handle: Handle!) {
    profiles(request: { handles: [$handle], limit: 1 }) {
      items {
        id
        name
        bio
        metadata
        isDefault
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
        coverPicture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        ownedBy
        stats {
          totalFollowers
          totalFollowing
        }
        followModule {
          ... on FeeFollowModuleSettings {
            type
            amount {
              asset {
                symbol
                name
                decimals
                address
              }
              value
            }
            recipient
          }
          ... on ProfileFollowModuleSettings {
            type
          }
          ... on RevertFollowModuleSettings {
            type
          }
        }
      }
    }
  }
`;

const GET_PROFILES_OWNED = gql`
  query ($ownedBy: EthereumAddress!) {
    profiles(request: { ownedBy: [$ownedBy] }) {
      items {
        id
        name
        bio
        metadata
        isDefault
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
        coverPicture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        ownedBy
        stats {
          totalFollowers
          totalFollowing
        }
        followModule {
          ... on FeeFollowModuleSettings {
            type
            amount {
              asset {
                symbol
                name
                decimals
                address
              }
              value
            }
            recipient
          }
          ... on ProfileFollowModuleSettings {
            type
          }
          ... on RevertFollowModuleSettings {
            type
          }
        }
      }
    }
  }
`;

const GET_PROFILE_HANDLE_BY_ID = gql`
  query ($id: ProfileId!) {
    profile(request: { profileId: $id }) {
      handle
    }
  }
`;


export const getProfileByHandle = async (handle: string): Promise<Profile[] | null> => {
  try {
    const profiles = await request({
      url: apiUrls.lensAPI,
      document: GET_PROFILE_BY_HANDLE,
      variables: { handle },
    });

    return profiles?.items?.length ? profiles.items[0] : null;
  } catch (error) {
    console.log(error);
  }
};

export const useGetProfileByHandle = (handle: string) => {
  return useQuery(["profile", handle], () => getProfileByHandle(handle), {
    enabled: !!handle,
  });
};

export const getProfilesOwned = async (ownedBy: string): Promise<Profile[]> => {
  try {
    const profiles = await request({
      url: apiUrls.lensAPI,
      document: GET_PROFILES_OWNED,
      variables: { ownedBy },
    });

    return profiles?.items as unknown as Profile[];
  } catch (error) {
    console.log(error);
  }
};

export const useGetProfilesOwned = (ownedBy: string) => {
  return useQuery(["profiles", ownedBy], () => getProfilesOwned(ownedBy), {
    enabled: !!ownedBy,
  });
};

export const getHandleById = async (id?: string): Promise<string> => {
  try {
    if (!id) return null;

    const profile = await request({
      url: apiUrls.lensAPI,
      document: GET_PROFILE_HANDLE_BY_ID,
      variables: { id: BigNumber.from(id).toHexString() },
    });

    return profile?.handle;
  } catch (error) {
    console.log(error);
  }
};

export const useGetHandleById = (id?: string) => {
  return useQuery(["handle", id], () => getHandleById(id), {
    enabled: !!id,
  });
};