import { JamProvider } from 'jam-core-react';
import { SPACE_API_URL } from "@/lib/consts";

const IS_DEVELOPMENT = false; // DISABLE IN PROD

const JamProviderWrapper = ({ children }) => {
  const jamConfig = {
    domain: SPACE_API_URL,
    urls: {
      pantry: SPACE_API_URL
    },
    development: IS_DEVELOPMENT,
  };

  return (
    <JamProvider options={{ jamConfig }}>
      {children}
    </JamProvider>
  );
};

export default JamProviderWrapper;
