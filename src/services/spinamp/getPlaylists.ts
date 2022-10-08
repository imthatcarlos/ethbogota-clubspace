import { fetchCollectorPlaylists, IPlaylist } from "@spinamp/spinamp-sdk";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export const useGetPlaylistsFromAddress = (options: UseQueryOptions = {}, address: string) => {
  const result = useQuery<IPlaylist[] | null>(
    ["playlists", address],
    async () => {
      const result = await fetchCollectorPlaylists(address);

      return result;
    },
    {
      ...(options as any),
      enabled: !!address,
    }
  );

  return result;
};
