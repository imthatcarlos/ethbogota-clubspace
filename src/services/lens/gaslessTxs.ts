import { v4 as uuid } from "uuid";
import { defaultAbiCoder } from "ethers/lib/utils";
import request, { gql } from "graphql-request";
import { apiUrls } from "@/constants/apiUrls";
import omitDeep from "omit-deep";
import { FREE_COLLECT_MODULE } from "@/lib/consts";

export const LENS_HUB_NFT_NAME = "Lens Protocol Profiles";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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
      collectModule: FREE_COLLECT_MODULE,
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

const FOLLOW_TYPED_DATA = gql`
  mutation CreateFollowTypedData($profileId: ProfileId!) {
    createFollowTypedData(request: { follow: [{ profile: $profileId, followModule: null }] }) {
      id
      expiresAt
      typedData {
        domain {
          name
          chainId
          version
          verifyingContract
        }
        types {
          FollowWithSig {
            name
            type
          }
        }
        value {
          nonce
          deadline
          profileIds
          datas
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

export const createTypedData = async (_request, accessToken, document) => {
  const result = await request({
    url: apiUrls.lensAPI,
    document,
    variables: _request,
    requestHeaders: {
      "x-access-token": accessToken,
    },
  });

  return result.createPostTypedData || result.createFollowTypedData;
};

export const signCreateTypedData = async (_request, signer, accessToken, document) => {
  const result = await createTypedData(_request, accessToken, document);
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

  const signedResult = await signCreateTypedData(createPostRequest, signer, accessToken, CREATE_POST_TYPED_DATA);

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

export const followProfileGasless = async (profileId: string, signer, accessToken: string) => {
  const createPostRequest = {
    profileId,
  };

  const signedResult = await signCreateTypedData(createPostRequest, signer, accessToken, FOLLOW_TYPED_DATA);

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
