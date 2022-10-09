import { apiUrls } from "@/constants/apiUrls";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
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
  lensHandle: string | null;
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

const GET_PROFILES_BY_HANDLES = gql`
  query ($request: ProfileQueryRequest!) {
    profiles(request: $request) {
      items {
        handle
        name
        bio
        stats {
          totalFollowers
        }
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
      }
      pageInfo {
        prev
        next
        totalCount
      }
    }
  }
`;

export const getProfileByHandle = async (handle: string): Promise<Profile | null> => {
  try {
    const { profiles } = await request({
      url: apiUrls.lensAPI,
      document: GET_PROFILE_BY_HANDLE,
      variables: { handle },
    });

    return profiles?.items?.length ? profiles.items[0] : null;
  } catch (error) {
    console.log(error);
  }
};

export const useGetProfileByHandle = (options: UseQueryOptions = {}, handle: string) => {
  const result = useQuery<Profile | null>(
    ["profiles", handle],
    async () => {
      const result = await getProfileByHandle(handle);

      return result;
    },
    {
      ...(options as any),
      enabled: !!handle,
    }
  );

  return result;
};

export const getProfilesOwned = async (ownedBy: string): Promise<Profile[]> => {
  try {
    const { profiles } = await request({
      url: apiUrls.lensAPI,
      document: GET_PROFILES_OWNED,
      variables: { ownedBy },
    });

    return profiles?.items as unknown as Profile[];
  } catch (error) {
    console.log(error);
  }
};

export const useGetProfilesOwned = (options: UseQueryOptions = {}, ownedBy: string) => {
  const result = useQuery<Profile[]>(
    ["profiles", ownedBy],
    async () => {
      const result = await getProfilesOwned(ownedBy);

      return result;
    },
    {
      ...(options as any),
      enabled: !!ownedBy,
    }
  );

  return result;
};

export const getHandleById = async (id?: string): Promise<string> => {
  try {
    if (!id) return null;

    const { profile } = await request({
      url: apiUrls.lensAPI,
      document: GET_PROFILE_HANDLE_BY_ID,
      variables: { id: BigNumber.from(id).toHexString() },
    });

    return profile?.handle;
  } catch (error) {
    console.log(error);
  }
};

export const useGetHandleById = (options: UseQueryOptions = {}, id?: string) => {
  const result = useQuery<string>(
    ["profiles", id],
    async () => {
      const result = await getHandleById(id);

      return result;
    },
    {
      ...(options as any),
      enabled: !!id,
    }
  );

  return result;
};

export const getProfilesByHandles = async (handles?: string[], limit = 50): Promise<any> => {
  if (!handles?.length) return null;

  try {
    let cursor = null;
    let items: any[] = [];

    do {
      const _request = cursor ? { handles, limit, cursor } : { handles, limit };

      const { profiles } = await request({
        url: apiUrls.lensAPI,
        document: GET_PROFILES_BY_HANDLES,
        variables: { request: _request },
      });

      items.push(profiles!.items.map((profile) => profile));

      cursor =
        JSON.parse(profiles!.pageInfo?.next).offset != profiles!.pageInfo?.totalCount ? profiles!.pageInfo!.next : null;
    } while (cursor);

    return items.flat();
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const useGetProfilesByHandles = (options: UseQueryOptions = {}, handles?: string[]) => {
  const result = useQuery<Profile[]>(
    ["profilesByHandles", handles],
    async () => {
      const result = await getProfilesByHandles(handles);

      return result;
    },
    {
      ...(options as any),
      enabled: !!handles,
    }
  );

  return result;
};
