import { Contract, providers } from "ethers";
import contractAbi from "./abi.json";

import { Group } from "@semaphore-protocol/group";
import { generateProof, packToSolidityProof } from "@semaphore-protocol/proof";
import { VERIFIER_ADDRESS } from "../consts";

const provider = new providers.JsonRpcProvider(process.env.MUMBAI_URL);
export const contract = new Contract(VERIFIER_ADDRESS, contractAbi, provider);

export const joinGroup = async (lensUsername, identity) => {
  const identityCommitment = identity.generateCommitment().toString();

  console.log(`Joining the group...`);

  const { status } = await fetch(`/api/semaphore/join-group`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identityCommitment,
      username: lensUsername,
    }),
  });

  if (status === 200) {
    console.log(`You joined the Club space group event 🎉 `);
  } else {
    console.log("Some error occurred, please try again!");
  }
};

export const createGroup = async (groupId, uri, lensPubId, lensProfileId) => {
  console.log(`Creating group...`);

  const { status } = await fetch(`/api/semaphore/create-group`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, uri, lensPubId, lensProfileId }),
  });

  if (status === 200) {
    console.log(`created groupid ${groupId}`);
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

    const { status } = await fetch(`/api/semaphore/claim-reward`, {
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
