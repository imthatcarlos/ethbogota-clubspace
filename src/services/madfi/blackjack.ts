import request, { gql } from 'graphql-request';
import { apiUrls } from '@/constants/apiUrls';

const GET_BLACKJACK_TABLE = gql`
  query getBlackjackTable($profileId: String!, $pubId: String!) {
    blackjackTables(where: { profileId: $profileId, pubId: $pubId }) {
      id
      creator
      originalBalance
      remainingBalance
      size
      activeGames
      pausedAt
      playerWins
      dealerWins
      profileId
      pubId
    }
  }

`;

// profileId and pubId should be decimal strings
export const getTable = async (profileId: string, pubId: string): Promise<string> => {
  try {
    const { blackjackTables } = await request({
      url: apiUrls.madfiSubgraph,
      document: GET_BLACKJACK_TABLE,
      variables: { profileId, pubId }
    });

    return blackjackTables?.length ? blackjackTables[0] : null;
  } catch (error) {
    console.log(error);
  }
};
