import { apiUrls } from "@/constants/apiUrls";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { useAccount, useSigner } from "wagmi";

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

export const useLensLogin = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const { data: challenge, refetch: refetchChallenge } = useQuery(
    ["challenge", address],
    () => generateChallenge(address),
    {
      enabled: false,
    }
  );

  const { data: signature } = useQuery(
    ["signature"],
    () => {
      return signer?.signMessage(challenge?.challenge?.text);
    },
    {
      enabled: !!challenge,
      staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  );

  const { data: authentication } = useQuery(["authentication", address], () => authenticate(address, signature), {
    enabled: !!address && !!signature,
    staleTime: 1000 * 60 * 60 * 24 * 7,
  });

  return { ...authentication?.authenticate, login: refetchChallenge };
};
