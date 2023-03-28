import { apiUrls } from "@/constants/apiUrls";
import request, { gql } from "graphql-request";
import { getAccessToken } from "@/hooks/useLensLogin";

const GET_POST = gql`
  query Publication($publicationId: InternalPublicationId!) {
    publication(request: { publicationId: $publicationId }) {
      __typename
      ... on Post {
        ...PostFields
      }
    }
  }

  fragment ProfileFields on Profile {
    id
    name
    bio
    metadata
    handle
    picture {
      ... on MediaSet {
        original {
          ...MediaFields
        }
      }
    }
    ownedBy
    stats {
      totalFollowers
      totalFollowing
      totalPosts
      totalComments
      totalMirrors
      totalPublications
      totalCollects
    }
  }

  fragment MediaFields on Media {
    url
    mimeType
  }

  fragment MetadataOutputFields on MetadataOutput {
    name
    description
    content
    media {
      original {
        ...MediaFields
      }
    }
    attributes {
      displayType
      traitType
      value
    }
  }

  fragment CollectModuleFields on CollectModule {
    ... on MultirecipientFeeCollectModuleSettings {
      contractAddress
    }
  }

  fragment PostFields on Post {
    id
    profile {
      ...ProfileFields
    }
    metadata {
      ...MetadataOutputFields
    }
    hidden
    stats {
      totalAmountOfCollects
    }
    collectModule {
      ...CollectModuleFields
    }
  }
`;

const HAS_COLLECTED_POST = gql`
  query Publication($publicationId: InternalPublicationId!) {
    publication(request: {
      publicationId: $publicationId
    }) {
      ... on Post {
        id
        hasCollectedByMe
      }
    }
  }
`;

export const getPost = async (publicationId: string): Promise<any> => {
  try {
    const { publication } = await request({
      url: apiUrls.lensAPI,
      document: GET_POST,
      variables: { publicationId },
    });

    return publication;
  } catch (error) {
    console.log(error);
  }
};


export const hasCollectedPost = async (publicationId: string): Promise<any> => {
  try {
    const { publication } = await request({
      url: apiUrls.lensAPI,
      document: HAS_COLLECTED_POST,
      variables: { publicationId },
      requestHeaders: {
        'x-access-token': getAccessToken()
      }
    });

    return publication.hasCollectedByMe;
  } catch (error) {
    console.log(error);
  }
};
