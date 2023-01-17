import { SoundClient } from '@soundxyz/sdk';
import { providers } from 'ethers'
import { IS_PRODUCTION, JSON_RPC_URL_ALCHEMY_MAP } from '@/lib/consts';

export default async (editionAddress: string) => {
  try {
    const chainId = IS_PRODUCTION ? 1 : 5; // mainnet, goerli
    const url = new providers.JsonRpcProvider(JSON_RPC_URL_ALCHEMY_MAP[chainId]);
    const client = SoundClient({ provider });

    const isAddressSoundEdition = await client.isSoundEdition({ editionAddress });
    if (!isAddressSoundEdition) return;

    const [contractInfo, schedule] = await Promise.all([
      client.editionInfo({ editionAddress }),
      client.activeMintSchedules({ editionAddress })
    ]);

    return {
      contractInfo,
      schedule,
    };
  } catch (error) {
    console.log(error);
  }
};
