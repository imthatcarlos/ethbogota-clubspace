import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { TIER_OPEN, TIER_GATED_LENS_COLLECT } from "@/lib/consts";
import { useIsAuthenticated } from "@/hooks/useLensLogin";
import { hasCollectedPost } from "@/services/lens/getPost";

export default (
  address: string,
  lensAccessToken: string,
  clubSpaceObject: any | undefined,
  options: UseQueryOptions = {}
) => {
  const result = useQuery<any>(
    ['meets-gated-condition', address],
    async () => {
      if (!clubSpaceObject) return;
      const { creatorLensProfileId, lensPubId, gated } = clubSpaceObject;
      if (!gated || gated.tier === TIER_OPEN) return true;

      if (gated.tier === TIER_GATED_LENS_COLLECT) {
        const publicationId = `${creatorLensProfileId}-${lensPubId}`;
        return await hasCollectedPost(publicationId);
      }

      throw new Error(`invalid gated.tier: ${gated.tier}`);
    },
    {
      ...(options as any),
      // we immediately return true if tier is opne, no need for lens auth
      enabled: !!address && !!lensAccessToken,
    }
  );

  return result;
};
