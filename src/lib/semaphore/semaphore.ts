import { Contract, providers, utils, Wallet } from "ethers";
import { abi as contractAbi } from "./abi.json";

import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";
import { generateProof, packToSolidityProof } from "@semaphore-protocol/proof";
import { parseBytes32String } from "ethers/lib/utils";

const contractAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

const provider = new providers.JsonRpcProvider(process.env.MUMBAI_URL);
const signer = new Wallet(process.env.ADMIN_KEY, provider);
export const contract = new Contract(contractAddress, contractAbi, signer);

export const joinGroup = async () => {
  const username = ""; // TODO: lens username
  const identityCommitment = ""; // TODO: from semaphore?

  console.log(`Joining the group...`);

  const { status } = await fetch(`/join-group`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identityCommitment,
      username,
    }),
  });

  if (status === 200) {
    console.log(`You joined the Club space group event 🎉 `);
  } else {
    console.log("Some error occurred, please try again!");
  }
};

export const createGroup = async ({ groupId, uri, lensPubId, lensProfileId }) => {
  console.log(`Creating group...`);

  const { status } = await fetch(`/create-group`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, uri, lensPubId, lensProfileId }),
  });

  if (status === 200) {
    console.log(`created`);
  } else {
    console.log("Some error occurred, please try again!");
  }
};

export const claimReward = async (groupId, recipientAddress, identity) => {
  try {
    const users = await contract.queryFilter(contract.filters.NewUser());
    const group = new Group();

    group.addMembers(users.map((e) => e.args![0].toString()));

    const { proof, publicSignals } = await generateProof(identity, group, groupId.toString(), recipientAddress);
    const solidityProof = packToSolidityProof(proof);

    const { status } = await fetch(`/claim-reward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientAddress,
        merkleRoot: publicSignals.merkleRoot,
        nullifierHash: publicSignals.nullifierHash,
        solidityProof,
      }),
    });

    if (status === 200) {
      console.log("success");
      return true;
    } else {
      console.log("Some error occurred, please try again!");
      return false;
    }
  } catch (error) {
    console.error(error);
    console.log("Some error occurred, please try again!");
    return false;
  }
};
