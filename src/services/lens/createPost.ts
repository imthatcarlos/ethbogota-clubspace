import { v4 as uuid } from "uuid";
import { defaultAbiCoder } from "ethers/lib/utils";

export const LENS_HUB_NFT_NAME = "Lens Protocol Profiles";

export const LENSHUB_PROXY = "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82"; // mumbai

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const FREE_COLLECT_MUMBAI = "0x0BE6bD7092ee83D44a6eC1D949626FeE48caB30c";
export const FREE_COLLECT_POLYGON = "0x23b9467334bEb345aAa6fd1545538F3d54436e96";

const trimify = (value: string): string => value?.replace(/\n\s*\n/g, "\n\n").trim();

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

export const makePost = async (contract, profileId, contentUri) => {
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
