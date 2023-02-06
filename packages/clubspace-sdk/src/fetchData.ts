export const getClubSpace = async (clubSpaceId: string) => {
  const response = await fetch(
    `https://clubspace-api-2e365.ondigitalocean.app/stream/${clubSpaceId}`
  );
  const data = await response.json();
  return data;
};
