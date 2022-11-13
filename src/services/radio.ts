import axios from 'axios';

const { NEXT_PUBLIC_SPACE_API_URL, SPACE_API_BEARER } = process.env;

export const startRadio = async ({ clubSpaceId, spinampPlaylistId, handle }) => {
  const res = await axios.post(
    `${NEXT_PUBLIC_SPACE_API_URL}/stream/${clubSpaceId}`,
    { spinampPlaylistId, handle },
    { headers: { 'Authorization': `Bearer ${SPACE_API_BEARER}` }}
  );

  console.log(`started radio: ${res.status}`);
};

export const getRadio = async ({ clubSpaceId }) => {
  try {
    const res = await axios.get(`${NEXT_PUBLIC_SPACE_API_URL}/stream/${clubSpaceId}`);

    return res.data.url;
  } catch (error) {
    return null;
  }
};
