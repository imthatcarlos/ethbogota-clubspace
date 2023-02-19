import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import getArtistReleases from '@/services/sound/getArtistReleases';

export default (
  address: string,
  options: UseQueryOptions = {}
) => {
  const result = useQuery<any>(
    ['sound-drops', address],
    async () => {
      return await getArtistReleases(address);
    },
    {
      ...(options as any),
      enabled: !!address,
    }
  );

  return result;
};
