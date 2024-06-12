import {
  fetchCollectorPlaylists,
  fetchPlaylistById,
  fetchTracksByIds,
} from "@spinamp/spinamp-sdk";
import { useQuery } from "@tanstack/react-query";

export const useGetPlaylistsFromAddress = (options = {}, address: string) => {
  return useQuery({
    queryKey: ["playlists", address],
    queryFn: async () => {
      const result = await fetchCollectorPlaylists(address);

      return result;
    },
    enabled: !!address,
    ...(options as any),
  });
};

export const useGetTracksFromPlaylist = (options = {}, playlistId) => {
  return useQuery({
    queryKey: ["tracks", playlistId],
    queryFn: async () => {
      const { playlist } = await fetchPlaylistById(playlistId);
      return await fetchTracksByIds(playlist.trackIds);
    },
    enabled: !!playlistId,
    ...(options as any),
  });
};