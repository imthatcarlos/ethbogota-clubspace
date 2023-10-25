import { LensClient, development } from "@lens-protocol/client";
import { IS_PRODUCTION } from '@/lib/consts';

// TODO: update for production after v2
const lensClient = new LensClient({ environment: IS_PRODUCTION ? null : development });

export default lensClient;