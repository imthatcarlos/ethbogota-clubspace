import axios from 'axios';

const {
  NEXT_PUBLIC_SPACE_API_URL,
  SPACE_API_BEARER,
  RADIOMAST_API_KEY
} = process.env;

const RADIOMAST_API_URL = 'https://api.radiomast.io/v1';

export const startRadio = async ({ clubSpaceId, spinampPlaylistId, spaceRedisKey }) => {
  const res = await axios.post(
    `${NEXT_PUBLIC_SPACE_API_URL}/stream/${clubSpaceId}`,
    { spinampPlaylistId, spaceRedisKey },
    { headers: { 'Authorization': `Bearer ${SPACE_API_BEARER}` }}
  );

  console.log(`started radio: ${res.status}`);
};

export const getRadio = async ({ clubSpaceId }) => {
  try {
    const res = await axios.get(`${NEXT_PUBLIC_SPACE_API_URL}/stream/${clubSpaceId}`);

    return res.data.streamURL;
  } catch (error) {
    return null;
  }
};

export const getCurrentTrack = async (playerUUID) => {
  try {
    const { data } = await axios.get(
      `${RADIOMAST_API_URL}/audioplayers/${playerUUID}/queued-tracks/`,
      { headers: { 'Authorization': `Token ${RADIOMAST_API_KEY}` } }
    );

    return data.length ? data[0].track.song : null;
  } catch (error) {
    console.log(error.statusCode || error);

    return null;
  }
};

export const getQueuedTracks = async (playerUUID) => {
  try {
    const { data } = await axios.get(
      `${RADIOMAST_API_URL}/audioplayers/${playerUUID}/queued-tracks/`,
      { headers: { 'Authorization': `Token ${RADIOMAST_API_KEY}` } }
    );

    return data?.map(({ track }) => track.song);
  } catch (error) {
    console.log(error.statusCode || error);

    return [];
  }
};
