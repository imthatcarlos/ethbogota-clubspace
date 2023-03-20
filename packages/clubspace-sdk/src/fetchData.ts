import { API_URL } from './consts';
import { fetchPlaylistById, fetchTracksByIds } from '@spinamp/spinamp-sdk';

export const getClubSpaceObject = async (handle: string) => {
  const response = await fetch(`${API_URL}/live/${handle}?includeTracks=true&includeStats=true`);

  if (response.status === 404) return;

  const data = await response.json();
  return data;
};

export const getClubSpace = async (handle: string) => {
  const clubSpaceObject = await getClubSpaceObject(handle);

  if (!clubSpaceObject) return {};

  const { playlist } = await fetchPlaylistById(clubSpaceObject.spinampPlaylistId);
  const tracks = await fetchTracksByIds(playlist.trackIds);

  return { clubSpaceObject, playlistTracks: tracks };
};
