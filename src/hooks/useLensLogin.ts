import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { useAccount, useSigner } from "wagmi";
import jwt from "jsonwebtoken";
import { apiUrls } from "@/constants/apiUrls";

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

const REFRESH = gql`
  mutation ($request: RefreshRequest!) {
    refresh(request: $request) {
      accessToken
      refreshToken
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

const refresh = (refreshToken: string) => {
  return request({
    url: apiUrls.lensAPI,
    document: REFRESH,
    variables: {
      request: { refreshToken },
    },
  });
};

export const getAccessToken = () => localStorage.getItem("lens_accessToken");
export const getRefreshToken = () => localStorage.getItem("lens_refreshToken");

type AuthenticateType = {
  accessToken: string;
  refreshToken: string;
};

const tryRefetch = async () => {
  const accessToken = getAccessToken();

  if (accessToken) {
    try {
      const decoded = jwt.decode(accessToken);

      if (Math.ceil(Date.now() / 1000) < decoded.exp) {
        const { refresh: refreshData } = await refresh(getRefreshToken());

        localStorage.setItem("lens_accessToken", refreshData?.accessToken);
        localStorage.setItem("lens_refreshToken", refreshData?.refreshToken);

        return refreshData;
      } else {
        localStorage.removeItem("lens_accessToken");
        localStorage.removeItem("lens_refreshToken");
      }
    } catch (error) {
      console.log(error);
    }
  }
};

export const useLensRefresh = (options: UseQueryOptions = {}) => {
  const result = useQuery<AuthenticateType | null>(
    ["lens-refresh"],
    async () => {
      const refreshResult = await tryRefetch();

      return refreshResult || null;
    },
    {
      ...(options as any),
      enabled: !!getAccessToken(),
      staleTime: 1000 * 60 * 15, // 15min
    }
  );

  return result;
};

export const useLensLogin = (options: UseQueryOptions = {}) => {
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const result = useQuery<AuthenticateType | null>(
    ["lens-login", address],
    async () => {
      const challenge = await generateChallenge(address);
      const signature = await signer?.signMessage(challenge?.challenge?.text);
      const result = await authenticate(address, signature);

      localStorage.setItem("lens_accessToken", result?.authenticate?.accessToken);
      localStorage.setItem("lens_refreshToken", result?.authenticate?.refreshToken);

      return result;
    },
    {
      ...(options as any),
      enabled: false,
      staleTime: 1000 * 60 * 60 * 24, // 1 day
    }
  );

  return result;
};
