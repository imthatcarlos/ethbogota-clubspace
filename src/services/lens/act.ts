import { Contract, Signer } from 'ethers';
import { LENSHUB_PROXY } from "@/lib/consts";
import { LensHubProxy } from './abi';

// input the `Types.ProcessActionParams` struct for ILensProtocol#act()
// derive that from the `@/services/madfi/rewardEngagementAction`
export default async (signer: Signer, processActionParams: any) => {
  const contract = new Contract(LENSHUB_PROXY, LensHubProxy, signer);

  const tx = await contract.act(processActionParams, { gasLimit: 400_000 });
  console.log(`tx: ${tx.hash}`);

  await tx.wait();
};
