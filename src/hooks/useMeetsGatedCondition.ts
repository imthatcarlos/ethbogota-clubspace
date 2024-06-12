import { useQuery } from '@tanstack/react-query';
import { TIER_GATED_BADGE_HOLDERS } from "@/lib/consts";
// import { hasCollectedPost } from "@/services/lens/getPost";
import getBadgeOwned from "@/services/madfi/getBadgeOwned";

export default (
  address: string,
  gated?: { tier?: string, collectionId?: string },
  options = {}
) => {
  return useQuery({
    queryKey: ['meets-gated-condition', address],
    queryFn: async () => {
      if (!gated?.tier) return true;

      if (gated.tier === TIER_GATED_BADGE_HOLDERS) {
        const tokenId = await getBadgeOwned(gated.collectionId, address.toLowerCase());
        return !!tokenId;
      }
    },
    enabled: !!address,
    ...(options as any),
  });
};