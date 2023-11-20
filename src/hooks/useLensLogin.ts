import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useAccount, useSigner } from "wagmi";
import { useGetProfilesOwned } from "@/services/lens/getProfile";
import { lensClient } from "@/services/lens/client";

export const getAccessToken = async () => {
  const accessTokenResult = await lensClient.authentication.getAccessToken();
  return accessTokenResult.unwrap();
};

export const useAuthenticatedAccessToken = () => {
  const result = useQuery(
    ["lens-authenticated-access-token"],
    async () => {
      return await getAccessToken();
    },
    {
      enabled: true,
    }
  );

  return result;
}

export const useAuthenticatedProfileId = () => {
  const result = useQuery(
    ["lens-authenticated-profileId"],
    async () => {
      return await lensClient.authentication.getProfileId();
    },
    {
      enabled: true,
    }
  );

  return result;
}

export const useIsAuthenticated = () => {
  const result = useQuery(
    ["lens-authenticated"],
    async () => {
      return await lensClient.authentication.isAuthenticated();
    },
    {
      enabled: true,
    }
  );

  return result;
};

export const useLensLogin = (options: UseQueryOptions = {}) => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const { data: profilesOwned } = useGetProfilesOwned({}, address);

  const result = useQuery(
    ["lens-login", address],
    async () => {
      const { defaultProfile } = profilesOwned as any;
      if (!defaultProfile) throw new Error('No profiles');

      const { id, text } = await lensClient.authentication.generateChallenge({
        signedBy: address,
        for: defaultProfile.id
      });

      const signature = await signer.signMessage(text);

      await lensClient.authentication.authenticate({ id, signature });
    },
    {
      ...(options as any),
      enabled: false,
      staleTime: 1000 * 60 * 60 * 24, // 1 day
    }
  );

  return result;
};
