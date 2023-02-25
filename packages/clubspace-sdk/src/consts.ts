export const API_URL =
  process.env.API_URL || 'https://clubspace-api-2e365.ondigitalocean.app';

export const SITE_URL = 'https://www.joinclubspace.xyz/';

export const jamConfig = {
  domain: API_URL,
  urls: {
    pantry: API_URL,
    jam: 'https://localhost:3001',
  },
  development: false,
  sfu: true,
};
