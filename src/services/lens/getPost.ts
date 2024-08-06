import { apiUrls } from "@/constants/apiUrls";
import request, { gql } from "graphql-request";
import { getAccessToken } from "@/hooks/useLensLogin";
import { lensClient } from './client';
import { AnyPublicationFragment } from "@lens-protocol/client";

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

export const getPost = async (publicationId: string): Promise<AnyPublicationFragment> => {
  try {
    return await lensClient.publication.fetch({ forId: publicationId });
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
        'x-access-token': await getAccessToken()
      }
    });

    return publication.hasCollectedByMe;
  } catch (error) {
    console.log(error);
  }
};
