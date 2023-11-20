import { LensClient, development, production } from "@lens-protocol/client";
import { IS_PRODUCTION } from '@/lib/consts';

export const LENS_ENVIRONMENT = IS_PRODUCTION ? production : development;

export const lensClient = new LensClient({ environment: LENS_ENVIRONMENT });