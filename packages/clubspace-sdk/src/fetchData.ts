export const getClubSpace = async () => {
  const response = await fetch(
    'https://clubspace-api-2e365.ondigitalocean.app'
  );
  const data = await response.json();
  return data;
};
