import { v4 as uuid } from "uuid";
import { defaultAbiCoder } from "ethers/lib/utils";
import request, { gql } from "graphql-request";
import { apiUrls } from "@/constants/apiUrls";
import omitDeep from "omit-deep";

export const LENS_HUB_NFT_NAME = "Lens Protocol Profiles";
export const LENSHUB_PROXY = "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82"; // mumbai
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const FREE_COLLECT_MUMBAI = "0x0BE6bD7092ee83D44a6eC1D949626FeE48caB30c";
export const FREE_COLLECT_POLYGON = "0x23b9467334bEb345aAa6fd1545538F3d54436e96";

const trimify = (value: string): string => value?.replace(/\n\s*\n/g, "\n\n").trim();

export const omit = (object: any, name: string) => {
  return omitDeep(object, name);
};

export const publicationBody = (publicationContent, attachments, profileHandle) => ({
  version: "2.0.0",
  metadata_id: uuid(),
  description: trimify(publicationContent),
  content: trimify(publicationContent),
  external_url: `https://www.joinclubspace.xyz`,
  image: attachments.length > 0 ? attachments[0]?.item : null,
  imageMimeType: attachments.length > 0 ? attachments[0]?.type : null,
  name: `Post by @${profileHandle}`,
  mainContentFocus: attachments.length > 0 ? (attachments[0]?.type === "video/mp4" ? "VIDEO" : "IMAGE") : "TEXT_ONLY",
  contentWarning: null, // TODO
  attributes: [
    {
      traitType: "string",
      key: "type",
      value: "post",
    },
  ],
  media: attachments,
  locale: "en",
  createdOn: new Date(),
  appId: "Club Space",
});

export const makePostTx = async (contract, profileId, contentUri) => {
  try {
    const tx = await contract.post({
      profileId,
      contentURI: contentUri,
      collectModule: FREE_COLLECT_MUMBAI,
      collectModuleInitData: defaultAbiCoder.encode(["bool"], [true]),
      referenceModule: ZERO_ADDRESS,
      referenceModuleInitData: [],
    });
    console.log(`tx: ${tx.hash}`);

    await tx.wait();
    return tx;
  } catch (error) {
    console.log("createPost", error);
  }
};

const CREATE_POST_TYPED_DATA = gql`
  mutation CreatePostTypedData($profileId: ProfileId!, $contentURI: Url!) {
    createPostTypedData(
      request: {
        profileId: $profileId
        contentURI: $contentURI
        collectModule: { freeCollectModule: { followerOnly: false } }
        referenceModule: { followerOnlyReferenceModule: false }
      }
    ) {
      id
      expiresAt
      typedData {
        types {
          PostWithSig {
            name
            type
          }
        }
        domain {
          name
          chainId
          version
          verifyingContract
        }
        value {
          nonce
          deadline
          profileId
          contentURI
          collectModule
          collectModuleInitData
          referenceModule
          referenceModuleInitData
        }
      }
    }
  }
`;

const BROADCAST = gql`
  mutation Broadcast($request: BroadcastRequest!) {
    broadcast(request: $request) {
      ... on RelayerResult {
        txHash
        txId
      }
      ... on RelayError {
        reason
      }
    }
  }
`;

export const createPostTypedData = async (_request, accessToken) => {
  const result = await request({
    url: apiUrls.lensAPI,
    document: CREATE_POST_TYPED_DATA,
    variables: _request,
    requestHeaders: {
      "x-access-token": accessToken,
    },
  });

  return result.createPostTypedData;
};

export const signCreatePostTypedData = async (_request, signer, accessToken) => {
  const result = await createPostTypedData(_request, accessToken);
  console.log("create post: createPostTypedData", result);

  const typedData = result.typedData;
  console.log("create post: typedData", typedData);

  const signature = await signer._signTypedData(
    omit(typedData.domain, "__typename"),
    omit(typedData.types, "__typename"),
    omit(typedData.value, "__typename")
  );
  console.log("create post: signature", signature);

  return { result, signature };
};

export const broadcastRequest = async (_request, accessToken) => {
  const result = await request({
    url: apiUrls.lensAPI,
    document: BROADCAST,
    variables: { request: _request },
    requestHeaders: {
      "x-access-token": accessToken,
    },
  });

  return result.broadcast;
};

export const makePostGasless = async (profileId: string, contentURI: string, signer, accessToken: string) => {
  contentURI = contentURI.startsWith("ipfs://") ? contentURI : "ipfs://" + contentURI;
  const createPostRequest = {
    profileId,
    contentURI,
    collectModule: {
      freeCollectModule: { followerOnly: false },
    },
    referenceModule: {
      followerOnlyReferenceModule: false,
    },
  };

  const signedResult = await signCreatePostTypedData(createPostRequest, signer, accessToken);

  try {
    const broadcastResult = await broadcastRequest(
      {
        id: [signedResult.result.id],
        signature: [signedResult.signature],
      },
      accessToken
    );

    return broadcastResult;
  } catch (error) {
    console.log(error);
  }
};
