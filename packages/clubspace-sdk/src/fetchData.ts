import { API_URL } from './consts';
import { fetchPlaylistById } from '@spinamp/spinamp-sdk';

export const getClubSpaceObject = async (handle: string) => {
  const response = await fetch(`${API_URL}/live/${handle}?includeTracks=true`);
  const data = await response.json();
  return data;
};

export const getClubSpace = async (handle: string) => {
  const clubSpaceObject = await getClubSpaceObject(handle);
  const playlist = await fetchPlaylistById(clubSpaceObject.spinampPlaylistId);
  return { clubSpaceObject, playlistTracks: playlist.playlistTracks };
};
