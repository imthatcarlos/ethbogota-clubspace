import request, { gql } from "graphql-request";
import { LENS_API_URL } from './../consts';
import { ILensProfile } from './../types';

const GET_PROFILES_OWNED = gql`
  query ($ownedBy: EthereumAddress!) {
    profiles(request: { ownedBy: [$ownedBy] }) {
      items {
        id
        name
        bio
        picture {
          ... on NftImage {
            uri
          }
          ... on MediaSet {
            original {
              url
            }
          }
          __typename
        }
        handle
        ownedBy
      }
    }
  }
`;

export const getProfilesOwned = async (ownedBy: string): Promise<ILensProfile[]> => {
  try {
    const { profiles } = await request({
      url: LENS_API_URL,
      document: GET_PROFILES_OWNED,
      variables: { ownedBy },
    });

    return profiles?.items as unknown as ILensProfile[];
  } catch (error) {
    console.log(error);
    return [];
  }
};
