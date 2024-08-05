import { Contract, Signer, utils } from 'ethers';
import { omit } from "lodash/object";
import { LENSHUB_PROXY } from "@/lib/consts";
import { LensHubProxy } from './abi';
import { lensClient, handleBroadcastResult } from "./client";

// input is signed type data from the lens api
export const createPostWithSig = async (signer: Signer, data: any, sig: any) => {
  const contract = new Contract(LENSHUB_PROXY, LensHubProxy, signer);

  const { v, r, s } = utils.splitSignature(sig);

  const tx = await contract.postWithSig({
    profileId: data.profileId,
    contentURI: data.contentURI,
    collectModule: data.collectModule,
    collectModuleInitData: data.collectModuleInitData,
    referenceModule: data.referenceModule,
    referenceModuleInitData: data.referenceModuleInitData,
    sig: { v, r, s, deadline: data.deadline },
  }, { gasLimit: 400_000 });
  console.log(`tx: ${tx.hash}`);

  await tx.wait();
};

// try to create a post using lens profile manager, else fallback to signed type data
export const createPostMomoka = async (
  walletClient: any,
  contentURI: string,
  authenticatedProfile?: any,
) => {
  // gasless + signless if they enabled the lens profile manager
  if (authenticatedProfile?.signless) {
    const broadcastResult = await lensClient.publication.postOnMomoka({ contentURI });
    return handleBroadcastResult(broadcastResult);
  }

  // gasless with signed type data
  const typedDataResult = await lensClient.publication.createMomokaPostTypedData({ contentURI });
  const { id, typedData } = typedDataResult.unwrap();

  const [account] = await walletClient.getAddresses();
  const signedTypedData = await walletClient.signTypedData({
    account,
    domain: omit(typedData.domain, "__typename"),
    types: omit(typedData.types, "__typename"),
    primaryType: "Post",
    message: omit(typedData.value, "__typename"),
  });

  const broadcastResult = await lensClient.transaction.broadcastOnMomoka({ id, signature: signedTypedData });
  return handleBroadcastResult(broadcastResult);
};