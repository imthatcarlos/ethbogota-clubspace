import { JamProvider } from '@/lib/jam-core-react';
import { SPACE_API_URL } from "@/lib/consts";

const jamHost = process.env.JAM_HOST || 'localhost:3000';
const jamSchema = process.env.JAM_SCHEMA || 'https://';

const JamProviderWrapper = ({ children }) => {
  const jamConfig = {
    domain: SPACE_API_URL,
    urls: {
      jam: process.env.JAM_URL,
      pantry: process.env.JAM_URL, // @TODO:
      // stun: process.env.JAM_STUN_SERVER || `stun:stun.${jamHost}:3478`,
      // turn: process.env.JAM_TURN_SERVER || `turn:turn.${jamHost}:3478`,
      // turnCredentials: {
      //   username: process.env.JAM_TURN_SERVER_USERNAME || 'test',
      //   credential: process.env.JAM_TURN_SERVER_CREDENTIAL || 'yieChoi0PeoKo8ni',
      // },
    },
    development: false, // DISABLE IN PROD
    sfu: process.env.JAM_SFU === 'true',
  };

  return (
    <JamProvider options={{ jamConfig }}>
      {children}
    </JamProvider>
  );
};

export default JamProviderWrapper;
