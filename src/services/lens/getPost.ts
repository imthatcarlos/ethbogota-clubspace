import { apiUrls } from "@/constants/apiUrls";
import request, { gql } from "graphql-request";

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

  fragment PostFields on Post {
    id
    profile {
      ...ProfileFields
    }
    metadata {
      ...MetadataOutputFields
    }
    hidden
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
