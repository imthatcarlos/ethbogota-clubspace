import { JamProvider } from '@/lib/jam-core-react';
import { SPACE_API_URL } from "@/lib/consts";

const jamHost = process.env.JAM_HOST || 'localhost:3001';
const jamSchema = process.env.JAM_SCHEMA || 'https://';

const JamProviderWrapper = ({ children }) => {
  const jamConfig = {
    domain: SPACE_API_URL,
    urls: {
      pantry: SPACE_API_URL,
      jam: process.env.JAM_URL || `${jamSchema}${jamHost}`,
      // stun: process.env.JAM_STUN_SERVER || `stun:stun.${jamHost}:3478`,
      // turn: process.env.JAM_TURN_SERVER || `turn:turn.${jamHost}:3478`,
      // turnCredentials: {
      //   username: process.env.JAM_TURN_SERVER_USERNAME || 'test',
      //   credential: process.env.JAM_TURN_SERVER_CREDENTIAL || 'yieChoi0PeoKo8ni',
      // },
    },
    development: false,
    sfu: true,
  };

  return (
    <JamProvider options={{ jamConfig }}>
      {children}
    </JamProvider>
  );
};

export default JamProviderWrapper;
