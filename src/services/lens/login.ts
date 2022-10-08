import { apiUrls } from "@/constants/apiUrls";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { useAccount, useSigner, useSignMessage } from "wagmi";

const AUTHENTICATION = gql`
  mutation ($request: SignedAuthChallenge!) {
    authenticate(request: $request) {
      accessToken
      refreshToken
    }
  }
`;

const GET_CHALLENGE = gql`
  query ($request: ChallengeRequest!) {
    challenge(request: $request) {
      text
    }
  }
`;

const generateChallenge = (address: string) => {
  return request({
    url: apiUrls.lensAPI,
    document: GET_CHALLENGE,
    variables: {
      request: { address },
    },
  });
};

const authenticate = (address: string, signature) => {
  return request({
    url: apiUrls.lensAPI,
    document: AUTHENTICATION,
    variables: {
      request: { address, signature },
    },
  });
};

export const useLensLogin = (enabled = false) => {
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const {
    data: challenge,
    isLoading: isLoadingChallenge,
    error: challengeError,
    refetch: refetchChallenge,
  } = useQuery(["challenge", address], () => generateChallenge(address), {
    enabled,
  });

  const { data: signature, refetch: refetchSignature } = useQuery(
    ["signature"],
    () => signer?.signMessage(challenge?.challenge?.text),
    {
      enabled: !!signer && !!challenge && enabled,
    }
  );

  const {
    data: authentication,
    isLoading: isLoadingAuthentication,
    error: authenticationError,
    refetch: refetchAuthentication,
  } = useQuery(["authentication", address], () => authenticate(address, signature), {
    enabled: !!signature,
  });
  return { ...authentication?.authenticate };
};
